import { StringCodec } from "nats"
import type { ConsumerPort } from "../../ports/event-bus.port"
import type { NatsConnectionManager } from "./nats-connection"

const sc = StringCodec()

export interface NatsConsumerConfig {
  stream: string
  consumerName: string
  batchSize?: number
  maxMessages?: number
}

interface HandlerEntry {
  event: string
  handler: (data: any) => Promise<void>
}

export class NatsConsumer implements ConsumerPort {
  private handlers: HandlerEntry[] = []
  private running = false

  constructor(
    private nats: NatsConnectionManager,
    private config: NatsConsumerConfig,
  ) {}

  on<T>(event: string, handler: (data: T) => Promise<void>): void {
    this.handlers.push({ event, handler: handler as (data: any) => Promise<void> })
  }

  async start(): Promise<void> {
    if (this.running) return
    this.running = true

    const js = this.nats.getJetStream()
    const consumer = await js.consumers.get(this.config.stream, this.config.consumerName)
    const messages = await consumer.consume({ max_messages: this.config.batchSize ?? 10 })

    ;(async () => {
      for await (const msg of messages) {
        if (!this.running) break
        try {
          const decoded = sc.decode(msg.data)
          const data = JSON.parse(decoded)
          const subject = msg.subject

          for (const h of this.handlers) {
            if (subject.startsWith(h.event)) {
              await h.handler(data)
            }
          }
          msg.ack()
        } catch {
          msg.nak()
        }
      }
    })()
  }

  async stop(): Promise<void> {
    this.running = false
  }

  async ack(msg: unknown): Promise<void> {
    return
  }

  async nack(msg: unknown, _delay?: number): Promise<void> {
    return
  }
}
