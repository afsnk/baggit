import { useEffect, useState, use } from "react"
import type {Msg, QueuedIterator,Status} from "@nats-io/nats-core"
import { natsConn } from "#/lib/nats";

export function useNats(subject?: string) {
  const nc = use(natsConn());
  const [status, setStatus] = useState(`connected to ${nc.getServer()}`);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [err, setErr] = useState<Error | null>(null);

  useEffect(() => {
    let stopped = false;
    const statusIter = nc.status() as QueuedIterator<Status>;

    nc.closed().then(() => {
      if (!stopped) setStatus("NATS connection closed - reload the page");
    });

    (async () => {
      for await (const s of statusIter) {
        if (s.type === "disconnect") {
          setStatus(`disconnected from ${nc.getServer()}`);
        } else if (s.type === "reconnect") {
          setStatus(`connected to ${nc.getServer()}`);
        }
      }
    })().catch((err) => {
      console.error("status:", err);
    });

    if (subject) {
      const sub = nc.subscribe(subject, {
        callback: (e, msg) => {
          if (e) {
            setErr(e);
            return;
          }
          const next = msg;
          setMessages((prev) => [...prev, next].slice(-5));
        },
      });

      return () => {
        stopped = true;
        statusIter.stop();
        sub.unsubscribe();
      };
    }


    return () => {
      stopped = true;
      statusIter.stop();
    };
  }, [nc, subject])

  return {messages, err, status}
}
