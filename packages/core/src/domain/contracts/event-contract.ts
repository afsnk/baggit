import type { DomainEvent, EventType, EventPayloadMap } from "../events/events"

export interface EventBusContract {
  emit<T extends EventType>(
    subject: T,
    payload: EventPayloadMap[T],
    traceId?: string,
  ): Promise<void>
  subscribe<T extends EventType>(
    subject: T,
    handler: (event: DomainEvent<T>) => Promise<void>,
  ): Promise<() => void>
}
