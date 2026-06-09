import type { ConsumerPort } from "../ports/event-bus.port"

export interface ConsumerConfig {
  stream: string
  consumerName: string
  batchSize?: number
  maxBytes?: number
  ackPolicy?: "explicit" | "all" | "none"
  maxDeliver?: number
  ackWaitMs?: number
}

export interface MessageHandler<T = unknown> {
  (data: T, ack: () => Promise<void>, nack: (delay?: number) => Promise<void>): Promise<void>
}

let defaultConsumer: ConsumerPort | null = null

export function setConsumer(consumer: ConsumerPort): void {
  defaultConsumer = consumer
}

export function getConsumer(): ConsumerPort {
  if (!defaultConsumer) {
    throw new Error("Consumer not configured. Call setConsumer() first.")
  }
  return defaultConsumer
}
