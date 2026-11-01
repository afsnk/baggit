import type { DomainEvent, EventType, EventPayloadMap } from "../domain/events/events"

export interface EventBusPort {
  emit<T extends EventType>(
    subject: T,
    payload: EventPayloadMap[T],
    traceId?: string,
  ): Promise<void>
  subscribe<T extends EventType>(
    subject: T,
    handler: (event: DomainEvent<T>) => Promise<void>,
  ): Promise<() => void>
  connect(): Promise<void>
  disconnect(): Promise<void>
}

export interface ConsumerPort {
  start(): Promise<void>
  stop(): Promise<void>
  on<T>(event: string, handler: (data: T) => Promise<void>): void
  ack(msg: unknown): Promise<void>
  nack(msg: unknown, delay?: number): Promise<void>
}
