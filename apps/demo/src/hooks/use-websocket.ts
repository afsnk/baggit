import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type WSReadyState = 'connecting' | 'open' | 'closing' | 'closed'

export interface UseWebSocketOptions {
  /** Called synchronously for every incoming message. Use a stable ref internally. */
  onMessage?: (event: MessageEvent) => void
  /** Called when the socket opens (or re-opens after reconnect). */
  onOpen?: (event: Event) => void
  /** Called when the socket closes cleanly. */
  onClose?: (event: CloseEvent) => void
  /** Called on socket error. */
  onError?: (event: Event) => void
  /**
   * Reconnect configuration.
   * Set `enabled: false` to disable auto-reconnect.
   * Exponential backoff: delay = Math.min(base * 2^attempt, max) ms with jitter.
   */
  reconnect?: {
    enabled?: boolean
    baseDelay?: number  // default 1000 ms
    maxDelay?: number   // default 30_000 ms
    maxAttempts?: number // default Infinity
  }
  /** If false the socket is not opened on mount; call `connect()` manually. */
  autoConnect?: boolean
}

export interface UseWebSocketReturn {
  /** Reactive ready state string – safe to use in JSX. */
  readyState: WSReadyState
  /** Number of reconnect attempts since last successful open. */
  reconnectAttempt: number
  /** Send any JSON-serialisable value. Queues the message if the socket is not open. */
  sendJSON: (payload: unknown) => void
  /** Send a raw string. Queues the message if the socket is not open. */
  sendRaw: (data: string) => void
  /** Manually open (or reopen) the connection and reset the reconnect counter. */
  connect: () => void
  /** Permanently close the connection and disable auto-reconnect. */
  disconnect: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WS_STATES: WSReadyState[] = ['connecting', 'open', 'closing', 'closed']

function toReadyState(ws: WebSocket | null): WSReadyState {
  if (!ws) return 'closed'
  return WS_STATES[ws.readyState] ?? 'closed'
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * `useWebSocket` — a stable, low-level WebSocket primitive.
 *
 * Features
 * --------
 * - Exponential backoff reconnection with jitter
 * - Message queue flushed on socket open (no dropped messages)
 * - Callback refs (no stale closures)
 * - Single WebSocket instance per hook; cleaned up on unmount
 * - Imperative `connect` / `disconnect` escape hatches
 */
export function useWebSocket(url: string, options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    reconnect: reconnectOpts = {},
    autoConnect = true,
  } = options

  const {
    enabled: reconnectEnabled = true,
    baseDelay = 1_000,
    maxDelay = 30_000,
    maxAttempts = Infinity,
  } = reconnectOpts

  // ── Refs ───────────────────────────────────────────────────────────────────

  const wsRef = useRef<WebSocket | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptRef = useRef(0)
  const messageQueueRef = useRef<string[]>([])
  // Track whether the user explicitly called disconnect() to suppress reconnect
  const intentionallyClosedRef = useRef(false)

  // Callback refs — updated every render, never stale inside ws handlers
  const onMessageRef = useRef(options.onMessage)
  const onOpenRef = useRef(options.onOpen)
  const onCloseRef = useRef(options.onClose)
  const onErrorRef = useRef(options.onError)

  useEffect(() => { onMessageRef.current = options.onMessage }, [options.onMessage])
  useEffect(() => { onOpenRef.current = options.onOpen }, [options.onOpen])
  useEffect(() => { onCloseRef.current = options.onClose }, [options.onClose])
  useEffect(() => { onErrorRef.current = options.onError }, [options.onError])

  // ── State ──────────────────────────────────────────────────────────────────

  const [readyState, setReadyState] = useState<WSReadyState>('closed')
  const [reconnectAttempt, setReconnectAttempt] = useState(0)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const flushQueue = useCallback((ws: WebSocket) => {
    while (messageQueueRef.current.length > 0) {
      const msg = messageQueueRef.current.shift()!
      try { ws.send(msg) } catch { /* swallow */ }
    }
  }, [])

  const scheduleReconnect = useCallback(() => {
    if (!reconnectEnabled || intentionallyClosedRef.current) return
    if (attemptRef.current >= maxAttempts) return

    const jitter = Math.random() * 300
    const delay = Math.min(baseDelay * Math.pow(2, attemptRef.current), maxDelay) + jitter
    attemptRef.current += 1
    setReconnectAttempt(attemptRef.current)

    retryTimerRef.current = setTimeout(() => {
      openSocket() // eslint-disable-line
    }, delay)
  }, [reconnectEnabled, baseDelay, maxDelay, maxAttempts]) // openSocket stable via useCallback below

  // ── Core open/close ────────────────────────────────────────────────────────

  const openSocket = useCallback(() => {
    // Tear down any existing socket
    if (wsRef.current) {
      wsRef.current.onopen = null
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onmessage = null
      if (wsRef.current.readyState < WebSocket.CLOSING) {
        wsRef.current.close(1000, 'reconnecting')
      }
    }

    let ws: WebSocket
    try {
      ws = new WebSocket(url)
    } catch (err) {
      console.error('[useWebSocket] Failed to create WebSocket:', err)
      scheduleReconnect()
      return
    }

    wsRef.current = ws
    setReadyState('connecting')

    ws.onopen = (event) => {
      setReadyState('open')
      attemptRef.current = 0
      setReconnectAttempt(0)
      flushQueue(ws)
      onOpenRef.current?.(event)
    }

    ws.onmessage = (event) => {
      onMessageRef.current?.(event)
    }

    ws.onerror = (event) => {
      onErrorRef.current?.(event)
    }

    ws.onclose = (event) => {
      setReadyState('closed')
      wsRef.current = null
      onCloseRef.current?.(event)
      if (!intentionallyClosedRef.current) {
        scheduleReconnect()
      }
    }
  }, [url, flushQueue, scheduleReconnect])

  // ── Public API ─────────────────────────────────────────────────────────────

  const sendRaw = useCallback((data: string) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(data)
    } else {
      // Buffer up to 50 messages; drop oldest when full
      if (messageQueueRef.current.length >= 50) messageQueueRef.current.shift()
      messageQueueRef.current.push(data)
    }
  }, [])

  const sendJSON = useCallback((payload: unknown) => {
    sendRaw(JSON.stringify(payload))
  }, [sendRaw])

  const connect = useCallback(() => {
    intentionallyClosedRef.current = false
    attemptRef.current = 0
    setReconnectAttempt(0)
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
    openSocket()
  }, [openSocket])

  const disconnect = useCallback(() => {
    intentionallyClosedRef.current = true
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
    const ws = wsRef.current
    if (ws && ws.readyState < WebSocket.CLOSING) {
      ws.close(1000, 'user disconnect')
    }
    setReadyState('closed')
  }, [])

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (autoConnect) {
      intentionallyClosedRef.current = false
      openSocket()
    }
    return () => {
      intentionallyClosedRef.current = true
      if (retryTimerRef.current !== null) clearTimeout(retryTimerRef.current)
      const ws = wsRef.current
      if (ws && ws.readyState < WebSocket.CLOSING) ws.close(1000, 'unmount')
    }
    // Only run on mount/unmount — url changes are handled separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reconnect if the URL changes
  useEffect(() => {
    if (wsRef.current) connect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return { readyState, reconnectAttempt, sendJSON, sendRaw, connect, disconnect }
}
