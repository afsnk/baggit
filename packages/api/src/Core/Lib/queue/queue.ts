import {
  AckPolicy,
  DeliverPolicy,
  DiscardPolicy,
  RetentionPolicy,
  type ConsumerConfig,
  type JetStreamClient,
  type JetStreamManager,
  type StreamConfig,
} from "@nats-io/jetstream";
import type { NatsConnection, WithRequired } from "@nats-io/transport-node";
import { jetstream, jetstreamManager } from "@nats-io/jetstream";

/**
 * A Queue is a JetStream stream configured for work-queue semantics: every
 * message is delivered to exactly one consumer and is deleted from the stream
 * the instant it is acknowledged. This gives at-least-once delivery (unacked
 * messages are redelivered) while keeping the stream small (acked messages are
 * purged by the server, so there is no manual cleanup to run).
 */
export interface QueueOptions {
  /** Stream name. Also used to derive the default subject prefix. */
  readonly name: string;
  /**
   * Subjects captured by this stream. Defaults to `<name>.>` so callers can
   * publish to `<name>.<jobType>` and route with a subject filter.
   */
  readonly subjects?: string[];
  /**
   * How long the server waits for an ack before redelivering (ms).
   * Handlers that run longer must call `job.heartbeat()` to extend this.
   */
  readonly ackWaitMs?: number;
  /**
   * Max delivery attempts before the server stops redelivering. Exhausted
   * messages remain in the stream until explicitly terminated or expired.
   */
  readonly maxDeliver?: number;
  /** Optional cap on total messages retained (backpressure). */
  readonly maxMessages?: number;
}

const DEFAULT_ACK_WAIT_MS = 30_000;
const DEFAULT_MAX_DELIVER = 5;

export class Queue {
  private constructor(
    readonly name: string,
    readonly subjectPrefix: string,
    private readonly js: JetStreamClient,
    private readonly jsm: JetStreamManager,
    private readonly opts: Required<Omit<QueueOptions, "subjects" | "maxMessages">> & {
      subjects: string[];
      maxMessages?: number;
    },
  ) {}

  /**
   * Connect to (or create) the underlying stream. Idempotent: safe to call on
   * every process boot. Uses WorkQueue retention so acked messages are removed.
   */
  static async open(nc: NatsConnection, options: QueueOptions): Promise<Queue> {
    const js = jetstream(nc);
    const jsm = await jetstreamManager(nc);

    const subjects = options.subjects ?? [`${options.name}.>`];
    const resolved = {
      name: options.name,
      subjects,
      ackWaitMs: options.ackWaitMs ?? DEFAULT_ACK_WAIT_MS,
      maxDeliver: options.maxDeliver ?? DEFAULT_MAX_DELIVER,
      maxMessages: options.maxMessages,
    };

    const config: WithRequired<Partial<StreamConfig>, "name"> = {
      name: resolved.name,
      subjects: resolved.subjects,
      retention: RetentionPolicy.Workqueue,
			discard: DiscardPolicy.Old,
			max_bytes: 500_000_000,
      ...(resolved.maxMessages ? { max_msgs: resolved.maxMessages } : {}),
    };

    // addOrUpdate keeps the stream config in sync without failing when it
    // already exists.
    await jsm.streams.add(config).catch(async (err) => {
      if (isAlreadyExists(err)) {
        await jsm.streams.update(resolved.name, config);
        return;
      }
      throw err;
    });

    return new Queue(resolved.name, subjectFor(resolved.subjects), js, jsm, resolved);
  }

  /** Publish a job. `type` is appended to the subject prefix for routing. */
  async enqueue<T = unknown>(
    type: string,
    payload: T,
    opts: { dedupeId?: string } = {},
  ): Promise<{ seq: number; duplicate: boolean }> {
    const subject = `${this.subjectPrefix}.${type}`;
    const data = new TextEncoder().encode(JSON.stringify(payload));
    const ack = await this.js.publish(subject, data, {
      // A dedupe id lets the server reject duplicates within its window,
      // giving effectively-once ingestion on top of at-least-once delivery.
      ...(opts.dedupeId ? { msgID: opts.dedupeId } : {}),
    });
    return { seq: ack.seq, duplicate: ack.duplicate };
  }

  /**
   * Ensure a durable consumer exists for a given job-type filter and return
   * its name. Durable consumers survive restarts and are shared by all workers
   * that use the same name, which is how horizontal scaling works.
   */
  async ensureConsumer(consumerName: string, filterType?: string): Promise<string> {
    const config: Partial<ConsumerConfig> = {
      durable_name: consumerName,
      ack_policy: AckPolicy.Explicit,
      deliver_policy: DeliverPolicy. All,
      ack_wait: this.opts.ackWaitMs * 1_000_000, // ns
			max_deliver: this.opts.maxDeliver,
			max_bytes: 500_000_000,
      ...(filterType ? { filter_subject: `${this.subjectPrefix}.${filterType}` } : {}),
    };
    await this.jsm.consumers.add(this.name, config);
    return consumerName;
  }

  /** Internal accessor used by Worker to bind to the stream's consumer. */
  get client(): JetStreamClient {
    return this.js;
  }

  get ackWaitMs(): number {
    return this.opts.ackWaitMs;
  }
}

function subjectFor(subjects: string[]): string {
  // Derive the prefix from the first subject, stripping a trailing wildcard.
  const first = subjects[0] ?? "";
  return first.replace(/\.(>|\*)$/, "");
}

function isAlreadyExists(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /already in use|exists/i.test(message);
}
