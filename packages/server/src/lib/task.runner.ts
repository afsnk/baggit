import type { ServerMessage, TaskStep } from "./ws.helpers";

type Emit = (msg: ServerMessage) => void;

// ─── Step Definitions ─────────────────────────────────────────────────────────

interface StepDef {
  id: string;
  label: string;
  minMs: number;
  maxMs: number;
  progressMessages: string[];
}

const STEP_DEFS: StepDef[] = [
  {
    id: "init",
    label: "Initialising environment",
    minMs: 800,
    maxMs: 1600,
    progressMessages: [
      "Checking runtime version...",
      "Loading environment variables...",
      "Validating configuration schema...",
      "Warming up worker pool...",
    ],
  },
  {
    id: "fetch",
    label: "Fetching dependencies",
    minMs: 1500,
    maxMs: 3000,
    progressMessages: [
      "Resolving package graph...",
      "Downloading packages from registry...",
      "Verifying integrity hashes...",
      "Extracting archives...",
      "Linking node_modules...",
    ],
  },
  {
    id: "compile",
    label: "Compiling source files",
    minMs: 2000,
    maxMs: 4000,
    progressMessages: [
      "Scanning entry points...",
      "Parsing TypeScript AST...",
      "Running type checker...",
      "Transforming ES2022 → CommonJS...",
      "Emitting declaration files...",
    ],
  },
  {
    id: "lint",
    label: "Running static analysis",
    minMs: 800,
    maxMs: 2000,
    progressMessages: [
      "Loading ESLint ruleset...",
      "Analysing 312 source files...",
      "Checking code complexity...",
      "Verifying import order...",
    ],
  },
  {
    id: "test",
    label: "Executing test suite",
    minMs: 2500,
    maxMs: 5000,
    progressMessages: [
      "Booting test runner...",
      "Running unit tests (84/247)...",
      "Running integration tests (12/56)...",
      "Collecting coverage data...",
      "Generating coverage report...",
    ],
  },
  {
    id: "bundle",
    label: "Bundling production assets",
    minMs: 1500,
    maxMs: 3500,
    progressMessages: [
      "Resolving module graph...",
      "Tree-shaking dead code...",
      "Splitting chunks...",
      "Minifying JS (terser)...",
      "Compressing CSS...",
    ],
  },
  {
    id: "optimise",
    label: "Optimising output",
    minMs: 600,
    maxMs: 1500,
    progressMessages: [
      "Compressing images...",
      "Generating content hashes...",
      "Rewriting asset manifests...",
    ],
  },
  {
    id: "deploy",
    label: "Deploying to production",
    minMs: 1200,
    maxMs: 2800,
    progressMessages: [
      "Uploading build artifacts...",
      "Invalidating CDN cache...",
      "Running smoke tests...",
      "Updating DNS records...",
      "Verifying deployment health...",
    ],
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted)
      return reject(new DOMException("Aborted", "AbortError"));
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cloneSteps(steps: TaskStep[]): TaskStep[] {
  return steps.map(s => ({ ...s }));
}

// ─── Main Runner ──────────────────────────────────────────────────────────────

/**
 * Runs a simulated multi-step pipeline, emitting typed ServerMessages at every
 * meaningful state transition. The caller provides an AbortSignal to cancel mid-run.
 */
export async function runTask(
  taskId: string,
  emit: Emit,
  signal: AbortSignal,
): Promise<void> {
  const steps: TaskStep[] = STEP_DEFS.map(def => ({
    id: def.id,
    label: def.label,
    status: "pending",
    progress: 0,
    message: "Waiting…",
  }));

  const taskStartedAt = Date.now();

  // Announce task initialisation with the full step manifest
  emit({ type: "task:init", taskId, timestamp: taskStartedAt, steps: cloneSteps(steps) });

  try {
    for (let si = 0; si < STEP_DEFS.length; si++) {
      const def = STEP_DEFS[si]!;

      // ── Begin step ──────────────────────────────────────────────────────────
      const stepStartedAt = Date.now();
      steps[si] = {
        ...steps[si]!,
        status: "running",
        progress: 0,
        message: "Starting…",
        startedAt: stepStartedAt,
      };
      emit({ type: "task:step:start", taskId, timestamp: stepStartedAt, stepId: def.id, steps: cloneSteps(steps) });

      // ── Emit granular progress ticks ─────────────────────────────────────────
      const totalMs = rand(def.minMs, def.maxMs);
      const tickCount = rand(6, 14);

      for (let tick = 1; tick <= tickCount; tick++) {
        await sleep(totalMs / tickCount, signal);

        const progress = Math.min(99, Math.round((tick / tickCount) * 100));
        const msgIdx = Math.min(
          Math.floor((tick / tickCount) * def.progressMessages.length),
          def.progressMessages.length - 1,
        );
        const message = def.progressMessages[msgIdx]!;

        steps[si] = { ...steps[si]!, progress, message };
        emit({
          type: "task:step:progress",
          taskId,
          timestamp: Date.now(),
          stepId: def.id,
          progress,
          message,
          steps: cloneSteps(steps),
        });
      }

      // ── Complete step ────────────────────────────────────────────────────────
      const duration = Date.now() - stepStartedAt;
      steps[si] = {
        ...steps[si]!,
        status: "done",
        progress: 100,
        message: "Done",
        completedAt: Date.now(),
        duration,
      };
      emit({
        type: "task:step:complete",
        taskId,
        timestamp: Date.now(),
        stepId: def.id,
        duration,
        steps: cloneSteps(steps),
      });
    }

    // ── Task complete ──────────────────────────────────────────────────────────
    emit({
      type: "task:complete",
      taskId,
      timestamp: Date.now(),
      totalDuration: Date.now() - taskStartedAt,
      steps: cloneSteps(steps),
    });
  }
  catch (err) {
    if (signal.aborted) {
      // Mark all running steps as skipped
      for (let i = 0; i < steps.length; i++) {
        if (steps[i]!.status === "running") {
          steps[i] = { ...steps[i]!, status: "skipped", message: "Cancelled" };
        }
      }
      emit({ type: "task:cancelled", taskId, timestamp: Date.now(), steps: cloneSteps(steps) });
    }
    else {
      const message = err instanceof Error ? err.message : String(err);
      emit({ type: "task:error", taskId, timestamp: Date.now(), error: message, steps: cloneSteps(steps) });
    }
  }
}
