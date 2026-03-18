// ─── Enums / Literals ────────────────────────────────────────────────────────

export type TaskStatus = "idle" | "running" | "completed" | "failed" | "cancelled";
export type StepStatus = "pending" | "running" | "done" | "error" | "skipped";

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface TaskStep {
  id: string;
  label: string;
  status: StepStatus;
  progress: number; // 0–100
  message: string;
  startedAt?: number; // unix ms
  completedAt?: number;
  duration?: number; // ms
}

export interface TaskState {
  taskId: string | null;
  status: TaskStatus;
  steps: TaskStep[];
  progress: number; // overall 0–100 derived from steps
  startedAt?: number;
  completedAt?: number;
  totalDuration?: number;
  error?: string;
}

// ─── Server → Client Messages ─────────────────────────────────────────────────

export type ServerMessage
  = | {
    type: "task:init";
    taskId: string;
    timestamp: number;
    steps: TaskStep[];
  }
  | {
    type: "task:step:start";
    taskId: string;
    timestamp: number;
    stepId: string;
    steps: TaskStep[];
  }
  | {
    type: "task:step:progress";
    taskId: string;
    timestamp: number;
    stepId: string;
    progress: number;
    message: string;
    steps: TaskStep[];
  }
  | {
    type: "task:step:complete";
    taskId: string;
    timestamp: number;
    stepId: string;
    duration: number;
    steps: TaskStep[];
  }
  | {
    type: "task:step:error";
    taskId: string;
    timestamp: number;
    stepId: string;
    error: string;
    steps: TaskStep[];
  } | {
    type: "task:complete";
    taskId: string;
    timestamp: number;
    totalDuration: number;
    steps: TaskStep[];
  }
  | {
    type: "task:error";
    taskId: string;
    timestamp: number;
    error: string;
    steps: TaskStep[];
  }
  | {
    type: "task:cancelled";
    taskId: string;
    timestamp: number;
    steps: TaskStep[];
  }
  | {
    type: "pong";
    timestamp: number;
  }
  | {
    type: "error";
    message: string;
    timestamp: number;
  };

// ─── Client → Server Messages ─────────────────────────────────────────────────

export type ClientMessage
  = | { type: "task:start"; taskId: string }
    | { type: "task:cancel"; taskId: string }
    | { type: "ping" };

// ─── Type Guards ──────────────────────────────────────────────────────────────

export function isServerMessage(v: unknown): v is ServerMessage {
  return (
    typeof v === "object"
    && v !== null
    && "type" in v
    && typeof (v as Record<string, unknown>).type === "string"
  );
}

export function isClientMessage(v: unknown): v is ClientMessage {
  return (
    typeof v === "object"
    && v !== null
    && "type" in v
    && typeof (v as Record<string, unknown>).type === "string"
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive overall 0–100 progress from the step array */
export function deriveOverallProgress(steps: TaskStep[]): number {
  if (steps.length === 0)
    return 0;
  const total = steps.reduce((sum, s) => sum + s.progress, 0);
  return Math.round(total / steps.length);
}
