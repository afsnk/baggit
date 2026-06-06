import type { DomainEvent, EventType, EventPayloadMap } from "../domain/events/events"
import type { EventBusPort } from "../ports/event-bus.port"
import { getEventBus } from "./emit"

export interface SubscribeOptions {
  retries?: number
  idempotency?: boolean
}

export async function subscribe<T extends EventType>(
  subject: T,
  handler: (event: DomainEvent<T>) => Promise<void>,
  options?: SubscribeOptions,
): Promise<() => void> {
  const bus = getEventBus()
  return bus.subscribe(subject, handler)
}
