import { createNodeWebSocket } from "@hono/node-ws";

import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import index from "@/routes/index.route";
import transactions from "@/routes/transactions/transactions.index";

import type { ClientMessage } from "./lib/ws.helpers";

import { runTask } from "./lib/task.runner";
import { isClientMessage } from "./lib/ws.helpers";

const app = createApp();

configureOpenAPI(app);

// ─── WebSocket Endpoint ───────────────────────────────────────────────────────

const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });
/**
 * Each connection maintains its own isolated task context:
 *  - one active AbortController for cancellation
 *  - a simple task-running flag to prevent overlapping runs
 */
app.get(
  "/ws",
  upgradeWebSocket((_c) => {
    let abortController: AbortController | null = null;
    let isRunning = false;

    // Safely send a JSON payload; swallows errors if the socket has closed.
    function send(ws: { send: (data: string) => void }, payload: object) {
      try {
        ws.send(JSON.stringify(payload));
      }
      catch (error) {
        // socket likely already closed
        console.log("[ws] send error", error);
      }
    }

    return {
      onOpen(_event, ws) {
        console.log("[ws] client connected");
        // Let the client know it's ready
        send(ws, { type: "pong", timestamp: Date.now() });
      },

      onMessage(event, ws) {
        let msg: ClientMessage;

        // ── Parse ──────────────────────────────────────────────────────────────
        try {
          const raw = JSON.parse(String(event.data)) as unknown;
          if (!isClientMessage(raw))
            throw new Error("Unknown message shape");
          msg = raw;
        }
        catch (err) {
          send(ws, {
            type: "error",
            message: `Invalid message: ${err instanceof Error ? err.message : String(err)}`,
            timestamp: Date.now(),
          });
          return;
        }

        // ── Dispatch ───────────────────────────────────────────────────────────
        switch (msg.type) {
          case "ping": {
            send(ws, { type: "pong", timestamp: Date.now() });
            break;
          }

          case "task:start": {
            if (isRunning) {
              send(ws, {
                type: "error",
                message: "A task is already running. Cancel it first.",
                timestamp: Date.now(),
              });
              return;
            }

            const { taskId } = msg;
            abortController = new AbortController();
            isRunning = true;

            console.log(`[ws] task:start  taskId=${taskId}`);

            // Fire-and-forget; errors are emitted as task:error messages
            runTask(
              taskId,
              serverMsg => send(ws, serverMsg),
              abortController.signal,
            ).finally(() => {
              isRunning = false;
              abortController = null;
              console.log(`[ws] task:done   taskId=${taskId}`);
            });

            break;
          }

          case "task:cancel": {
            if (!isRunning || !abortController) {
              send(ws, {
                type: "error",
                message: "No task is currently running.",
                timestamp: Date.now(),
              });
              return;
            }
            console.log(`[ws] task:cancel taskId=${msg.taskId}`);
            abortController.abort();
            break;
          }

          default: {
            // Exhaustive — TypeScript will warn if a case is missed
            const _exhaustive: never = msg;
            void _exhaustive;
          }
        }
      },

      onClose(_event) {
        console.log("[ws] client disconnected");
        // Cancel any in-flight task when the socket closes
        abortController?.abort();
        isRunning = false;
      },

      onError(event) {
        console.error("[ws] socket error", event);
        abortController?.abort();
        isRunning = false;
      },
    };
  }),
);

const routes = [
  index,
  transactions,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];
export { injectWebSocket };
export default app;
