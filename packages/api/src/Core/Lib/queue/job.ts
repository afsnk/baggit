import type { JsMsg } from "@nats-io/jetstream";

/**
 * A Job wraps a single JetStream message and exposes a small, intention-
 * revealing lifecycle. Each terminal method maps to one JetStream ack:
 *
 *   complete() -> ack()   message succeeded; server deletes it from the queue
 *   retry()    -> nak()   transient failure; server redelivers it later
 *   fail()     -> term()  permanent failure; server stops redelivering
 *
 * Exactly one terminal method must be called per job. The Worker enforces this
 * by acking on your behalf if the handler returns without deciding.
 */
export class Job<T = unknown> {
  private settled = false;

  constructor(private readonly msg: JsMsg) {}

  /** Decoded JSON payload. Throws if the body is not valid JSON. */
  get data(): T {
    const text = new TextDecoder().decode(this.msg.data);
    return JSON.parse(text) as T;
  }

  /** The job type, taken from the last token of the subject. */
  get type(): string {
    return this.msg.subject.split(".").pop() ?? "";
  }

  /** Stream sequence — a stable, unique id for this delivery target. */
  get seq(): number {
    return this.msg.seq;
  }

  /** How many times this message has been delivered (1 on first attempt). */
  get attempt(): number {
    return this.msg.info.deliveryCount;
  }

  /** True if this is a redelivery of a previously-unacked message. */
  get redelivered(): boolean {
    return this.msg.redelivered;
  }

  /**
   * Tell the server we are still working, extending the ack deadline. Call
   * this from long-running handlers so the message is not redelivered while
   * still in progress.
   */
  heartbeat(): void {
    this.msg.working();
  }

  /** Mark success. The message is acked and removed from the queue. */
  async complete(): Promise<void> {
    if (this.settle()) await this.msg.ackAck();
  }

  /**
   * Mark a transient failure and request redelivery, optionally after a delay.
   * The server enforces maxDeliver, so this cannot loop forever.
   */
  retry(delayMs?: number): void {
    if (this.settle()) this.msg.nak(delayMs);
  }

  /** Mark a permanent failure. The message will not be redelivered. */
  fail(): void {
    if (this.settle()) this.msg.term();
  }

  /** Whether a terminal method has already run. */
  get isSettled(): boolean {
    return this.settled;
  }

  private settle(): boolean {
    if (this.settled) return false;
    this.settled = true;
    return true;
  }
}
