import type { DomainEvent, EventType } from "../domain/events/events"
import type { EventBusPort } from "../ports/event-bus.port"

/**
 * REQUIREMENTS.md §6a: no module-level singletons — the bus handle is injected.
 */
export async function subscribe<T extends EventType>(
  bus: EventBusPort,
  subject: T,
  handler: (event: DomainEvent<T>) => Promise<void>,
): Promise<() => void> {
  return bus.subscribe(subject, handler)
}
