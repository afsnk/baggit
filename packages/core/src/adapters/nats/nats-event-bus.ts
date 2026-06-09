import { StringCodec } from "nats"
import type { EventBusPort } from "../../ports/event-bus.port"
import type { DomainEvent, EventType, EventPayloadMap } from "../../domain/events/events"
import type { NatsConnectionManager } from "./nats-connection"
import { v4 } from "../../utils/id"

const sc = StringCodec()

export class NatsEventBus implements EventBusPort {
  constructor(private nats: NatsConnectionManager) {}

  async emit<T extends EventType>(
    subject: T,
    payload: EventPayloadMap[T],
    traceId?: string,
  ): Promise<void> {
    const nc = this.nats.getConnection()
    const event: DomainEvent<T> = {
      type: subject,
      payload,
      id: v4(),
      timestamp: new Date().toISOString(),
      traceId: traceId ?? v4(),
      subject: subject as string,
    }
    const data = sc.encode(JSON.stringify(event))
    nc.publish(subject as string, data)
  }

  async subscribe<T extends EventType>(
    subject: T,
    handler: (event: DomainEvent<T>) => Promise<void>,
  ): Promise<() => void> {
    const nc = this.nats.getConnection()
    const sub = nc.subscribe(subject as string, {
      callback: (err: Error | null, msg: any) => {
        if (err) {
          console.error(`[NatsEventBus] subscribe error on ${subject}:`, err)
          return
        }
        if (!msg) return
        try {
          const decoded = sc.decode(msg.data)
          const event = JSON.parse(decoded) as DomainEvent<T>
          handler(event)
        } catch (error) {
          console.error(`[NatsEventBus] handler error on ${subject}:`, error)
        }
      },
    })
    return () => { sub.unsubscribe() }
  }

  async connect(): Promise<void> {
    return
  }

  async disconnect(): Promise<void> {
    return
  }
}
