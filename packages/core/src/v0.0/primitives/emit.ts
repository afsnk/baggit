import type { EventType, EventPayloadMap } from "../domain/events/events"
import type { EventBusPort } from "../ports/event-bus.port"

/**
 * REQUIREMENTS.md §6a: no module-level singletons in library code.
 * The bus handle is injected via {@link createEmitter}; there is no global.
 */

export interface EmitOptions {
  traceId?: string
}

export interface Emitter {
  emit<T extends EventType>(subject: T, payload: EventPayloadMap[T], options?: EmitOptions): Promise<void>
}

export function createEmitter(bus: EventBusPort): Emitter {
  return {
    async emit<T extends EventType>(
      subject: T,
      payload: EventPayloadMap[T],
      options?: EmitOptions,
    ): Promise<void> {
      const traceId = options?.traceId ?? crypto.randomUUID()
      await bus.emit(subject, payload, traceId)
    },
  }
}
