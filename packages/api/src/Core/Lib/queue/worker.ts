import type { Consumer, ConsumerMessages } from "@nats-io/jetstream";
import { Job } from "./job";
import type { Queue } from "./queue";

export type Handler<T> = (job: Job<T>) => Promise<void> | void;

export interface WorkerOptions {
  /**
   * Durable consumer name. All workers sharing a name pull from the same
   * consumer, so scaling is just running more processes with the same name.
   */
  readonly consumer: string;
  /** Optional job-type filter (subject suffix). Omit to process all types. */
  readonly filterType?: string;
  /**
   * Emit `working()` at this interval (ms) while a handler runs, so the ack
   * deadline never lapses mid-processing. Defaults to half the queue ackWait.
   */
  readonly heartbeatMs?: number;
  /** Called when a handler throws and the job has not settled itself. */
  readonly onError?: (err: unknown, job: Job) => void;
}

/**
 * A Worker consumes one message at a time and runs a handler for each. Reading
 * one message at a time (`consume({ max_messages: 1 })`) keeps in-flight work
 * bounded and makes horizontal scaling behave predictably: no single worker
 * hoards messages, and a crash only risks redelivery of the one job it held.
 *
 * Delivery guarantees:
 *  - at-least-once: the message is acked only after the handler resolves.
 *    A crash or thrown error leaves it unacked, so the server redelivers it.
 *  - cleanup: because the Queue uses WorkQueue retention, a successful ack
 *    deletes the message from the stream — there is nothing to purge later.
 */
export class Worker<T = unknown> {
  private messages?: ConsumerMessages;
  private running = false;

  private constructor(
    private readonly consumer: Consumer,
    private readonly handler: Handler<T>,
    private readonly heartbeatMs: number,
    private readonly onError?: (err: unknown, job: Job) => void,
  ) {}

  static async start<T>(
    queue: Queue,
    handler: Handler<T>,
    options: WorkerOptions,
  ): Promise<Worker<T>> {
    const name = await queue.ensureConsumer(options.consumer, options.filterType);
    const consumer = await queue.client.consumers.get(queue.name, name);
    const heartbeatMs = options.heartbeatMs ?? Math.floor(queue.ackWaitMs / 2);

    const worker = new Worker<T>(consumer, handler, heartbeatMs, options.onError);
    void worker.run();
    return worker;
  }

  private async run(): Promise<void> {
    this.running = true;
    while (this.running) {
      this.messages = await this.consumer.consume({ max_messages: 1 });

      // Recover from a stalled server connection by re-establishing consume.
      void this.watchHeartbeats(this.messages);

      try {
        for await (const msg of this.messages) {
          await this.process(new Job<T>(msg));
        }
      } catch {
        // consume() ended (e.g. heartbeats missed / stopped); loop rebuilds it.
      }
    }
  }

  private async process(job: Job<T>): Promise<void> {
    const ticker = setInterval(() => {
      if (!job.isSettled) job.heartbeat();
    }, this.heartbeatMs);

    try {
      await this.handler(job);
      // If the handler didn't decide, treat a clean return as success.
      if (!job.isSettled) await job.complete();
    } catch (err) {
      if (!job.isSettled) {
        job.retry();
        this.onError?.(err, job as Job);
      }
    } finally {
      clearInterval(ticker);
    }
  }

  private async watchHeartbeats(messages: ConsumerMessages): Promise<void> {
    try {
      for await (const status of await messages.status()) {
        if (status.type === "heartbeats_missed" && (status.count as number) >= 2) {
          messages.stop();
          return;
        }
      }
    } catch {
      // status stream closed with the consume; nothing to do.
    }
  }

  /** Stop pulling new messages. In-flight work finishes first. */
  async stop(): Promise<void> {
    this.running = false;
    this.messages?.stop();
  }
}
