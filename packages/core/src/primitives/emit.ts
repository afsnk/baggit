import type { DomainEvent, EventType, EventPayloadMap } from "../domain/events/events"
import type { EventBusPort } from "../ports/event-bus.port"

export interface EmitOptions {
  traceId?: string
  retries?: number
  deadLetterSubject?: string
}

let defaultEventBus: EventBusPort | null = null

export function setEventBus(bus: EventBusPort): void {
  defaultEventBus = bus
}

export function getEventBus(): EventBusPort {
  if (!defaultEventBus) {
    throw new Error("EventBus not configured. Call setEventBus() first.")
  }
  return defaultEventBus
}

export async function emit<T extends EventType>(
  subject: T,
  payload: EventPayloadMap[T],
  options?: EmitOptions,
): Promise<void> {
  const bus = getEventBus()
  const traceId = options?.traceId ?? crypto.randomUUID()
  await bus.emit(subject, payload, traceId)
}
