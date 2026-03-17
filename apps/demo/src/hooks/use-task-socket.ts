import { useCallback, useReducer, useRef } from 'react'
import { useWebSocket, type WSReadyState } from './use-websocket'
import {
  isServerMessage,
  deriveOverallProgress,
  type TaskState,
  type TaskStep,
  type ServerMessage,
  type ClientMessage,
} from '@afsnk/pay-server/ws-types'

// ─── State & Reducer ──────────────────────────────────────────────────────────

const INITIAL_TASK_STATE: TaskState = {
  taskId: null,
  status: 'idle',
  steps: [],
  progress: 0,
}

type Action =
  | { type: 'RESET' }
  | { type: 'APPLY'; msg: ServerMessage }

function applyMessage(state: TaskState, msg: ServerMessage): TaskState {
  switch (msg.type) {
    case 'task:init':
      return {
        ...state,
        taskId: msg.taskId,
        status: 'running',
        steps: msg.steps,
        progress: 0,
        startedAt: msg.timestamp,
        completedAt: undefined,
        totalDuration: undefined,
        error: undefined,
      }

    case 'task:step:start':
    case 'task:step:progress':
    case 'task:step:complete':
    case 'task:step:error':
      return {
        ...state,
        steps: msg.steps,
        progress: deriveOverallProgress(msg.steps),
      }

    case 'task:complete':
      return {
        ...state,
        status: 'completed',
        steps: msg.steps,
        progress: 100,
        completedAt: msg.timestamp,
        totalDuration: msg.totalDuration,
      }

    case 'task:error':
      return {
        ...state,
        status: 'failed',
        steps: msg.steps,
        error: msg.error,
        completedAt: msg.timestamp,
      }

    case 'task:cancelled':
      return {
        ...state,
        status: 'cancelled',
        steps: msg.steps,
        completedAt: msg.timestamp,
      }

    default:
      return state
  }
}

function reducer(state: TaskState, action: Action): TaskState {
  switch (action.type) {
    case 'RESET':
      return INITIAL_TASK_STATE
    case 'APPLY':
      return applyMessage(state, action.msg)
  }
}

// ─── Log Entry ────────────────────────────────────────────────────────────────

export interface LogEntry {
  id: number
  timestamp: number
  level: 'info' | 'success' | 'error' | 'warn'
  text: string
}

// ─── Hook Return Type ─────────────────────────────────────────────────────────

export interface UseTaskSocketReturn {
  /** Typed task state: steps, overall progress, status, durations */
  task: TaskState
  /** Full event log for the current session */
  log: LogEntry[]
  /** WebSocket connection state */
  connectionState: WSReadyState
  /** How many reconnect attempts have been made */
  reconnectAttempt: number
  /**
   * Start a new task. Generates a taskId automatically unless you provide one.
   * Returns the taskId that was sent.
   */
  startTask: (taskId?: string) => string
  /** Cancel the currently running task */
  cancelTask: () => void
  /** Reset task state to idle */
  resetTask: () => void
  /** Manually open the WebSocket (if autoConnect was disabled) */
  connect: () => void
  /** Permanently close the WebSocket */
  disconnect: () => void
}

// ─── Options ──────────────────────────────────────────────────────────────────

export interface UseTaskSocketOptions {
  /** WebSocket server URL. Defaults to ws://localhost:3001/ws */
  url?: string
  /** Max log entries to keep in memory (default 200) */
  maxLogEntries?: number
  /** Auto-connect on mount? Default true */
  autoConnect?: boolean
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

let _logId = 0

/**
 * `useTaskSocket` — high-level hook for real-time long-running task tracking.
 *
 * Example
 * -------
 * ```tsx
 * const { task, log, connectionState, startTask, cancelTask } = useTaskSocket()
 *
 * // Start a task
 * const id = startTask()
 *
 * // Cancel it mid-run
 * cancelTask()
 *
 * // Render each step
 * task.steps.map(step => <StepRow key={step.id} step={step} />)
 * ```
 */
export function useTaskSocket(options: UseTaskSocketOptions = {}): UseTaskSocketReturn {
  const {
    url = 'ws://localhost:5173/ws',
    maxLogEntries = 200,
    autoConnect = true,
  } = options

  const [task, dispatch] = useReducer(reducer, INITIAL_TASK_STATE)
  const currentTaskIdRef = useRef<string | null>(null)

  // Use a ref-backed log so we never trigger re-renders for each log push;
  // we batch and sync to React state only via dispatchLog.
  const [log, setLog] = useReducer(
    (prev: LogEntry[], next: LogEntry) => {
      const updated = [...prev, next]
      return updated.length > maxLogEntries ? updated.slice(-maxLogEntries) : updated
    },
    [] as LogEntry[],
  )

  function pushLog(level: LogEntry['level'], text: string) {
    setLog({ id: ++_logId, timestamp: Date.now(), level, text })
  }

  // ── Message handler ────────────────────────────────────────────────────────

  const handleMessage = useCallback((event: MessageEvent) => {
    let parsed: unknown
    try {
      parsed = JSON.parse(event.data as string)
    } catch {
      pushLog('warn', `Received unparseable message`)
      return
    }

    if (!isServerMessage(parsed)) {
      pushLog('warn', `Unknown message type: ${String((parsed as Record<string,unknown>)?.type)}`)
      return
    }

    const msg = parsed

    // Update task state
    dispatch({ type: 'APPLY', msg })

    // Update log
    switch (msg.type) {
      case 'task:init':
        pushLog('info', `Task "${msg.taskId}" initialised with ${msg.steps.length} steps`)
        break
      case 'task:step:start': {
        const step = msg.steps.find((s: TaskStep) => s.id === msg.stepId)
        pushLog('info', `▶  ${step?.label ?? msg.stepId}`)
        break
      }
      case 'task:step:progress':
        // Intentionally not logging every tick to avoid log flooding
        break
      case 'task:step:complete': {
        const step = msg.steps.find((s: TaskStep) => s.id === msg.stepId)
        pushLog('success', `✔  ${step?.label ?? msg.stepId}  (${(msg.duration / 1000).toFixed(2)}s)`)
        break
      }
      case 'task:step:error': {
        const step = msg.steps.find((s: TaskStep) => s.id === msg.stepId)
        pushLog('error', `✘  ${step?.label ?? msg.stepId}: ${msg.error}`)
        break
      }
      case 'task:complete':
        pushLog('success', `🎉 Task completed in ${(msg.totalDuration / 1000).toFixed(2)}s`)
        break
      case 'task:error':
        pushLog('error', `Task failed: ${msg.error}`)
        break
      case 'task:cancelled':
        pushLog('warn', `Task cancelled`)
        break
      case 'pong':
        // silent
        break
      case 'error':
        pushLog('error', `Server error: ${msg.message}`)
        break
    }
  }, []) // dispatch is stable; pushLog is defined in scope

  // ── WebSocket ──────────────────────────────────────────────────────────────

  const { readyState, reconnectAttempt, sendJSON, connect, disconnect } = useWebSocket(url, {
    autoConnect,
    onMessage: handleMessage,
    onOpen: () => pushLog('info', 'WebSocket connected'),
    onClose: (e) => {
      if (e.code !== 1000) {
        pushLog('warn', `WebSocket closed (code ${e.code}) — reconnecting…`)
      }
    },
    onError: () => pushLog('error', 'WebSocket error'),
    reconnect: { enabled: true, baseDelay: 1000, maxDelay: 30_000 },
  })

  // ── Public API ─────────────────────────────────────────────────────────────

  const startTask = useCallback((taskId?: string): string => {
    const id = taskId ?? `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    currentTaskIdRef.current = id
    dispatch({ type: 'RESET' })
    const msg: ClientMessage = { type: 'task:start', taskId: id }
    sendJSON(msg)
    pushLog('info', `Sending task:start for "${id}"`)
    return id
  }, [sendJSON])

  const cancelTask = useCallback(() => {
    const taskId = currentTaskIdRef.current
    if (!taskId) return
    const msg: ClientMessage = { type: 'task:cancel', taskId }
    sendJSON(msg)
  }, [sendJSON])

  const resetTask = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    task,
    log,
    connectionState: readyState,
    reconnectAttempt,
    startTask,
    cancelTask,
    resetTask,
    connect,
    disconnect,
  }
}
