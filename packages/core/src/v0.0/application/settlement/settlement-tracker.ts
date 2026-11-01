import type { EventBusPort } from "../../ports/event-bus.port"

/**
 * REQUIREMENTS.md §6b: no in-process timers.
 * The legacy in-process polling map is gone. Check tasks are durable queue
 * messages (`SettlementCheckDue`) consumed by a JetStream work group — any
 * instance may crash and another resumes the work.
 */

export interface SettlementCheckSchedulerDeps {
  bus: EventBusPort
}

export interface ScheduleOptions {
  /** Attempt counter for bounded retry; the consumer re-enqueues while incomplete. */
  attempt?: number
}

const MAX_ATTEMPTS = 60

export class SettlementCheckScheduler {
  private bus: EventBusPort

  constructor(deps: SettlementCheckSchedulerDeps) {
    this.bus = deps.bus
  }

  /** Enqueue (or re-enqueue) a settlement status check as a queue task. */
  async schedule(
    settlement: { id: string; transactionId: string; provider: string },
    options?: ScheduleOptions,
  ): Promise<void> {
    await this.bus.emit(
      "SettlementCheckDue",
      {
        settlementId: settlement.id,
        transactionId: settlement.transactionId,
        provider: settlement.provider,
        attempt: options?.attempt ?? 0,
        dueAt: new Date().toISOString(),
      },
    )
  }
}

export interface SettlementCheckHandlerDeps {
  scheduler: SettlementCheckScheduler
  checkStatus: (txId: string, provider: string) => Promise<"pending" | "settled" | "failed">
}

/**
 * Factory for the consumer-side handler. Returns a handler suitable for
 * `bus.subscribe("SettlementCheckDue", ...)`. Re-enqueues with an incremented
 * attempt while the settlement is still pending; stops on settled/failed or
 * when attempts are exhausted.
 */
export function createSettlementCheckHandler(
  deps: SettlementCheckHandlerDeps,
): (event: { payload: { settlementId: string; transactionId: string; provider: string; attempt: number } }) => Promise<void> {
  return async (event) => {
    const { settlementId, transactionId, provider, attempt } = event.payload
    if (attempt >= MAX_ATTEMPTS) return
    const status = await deps.checkStatus(transactionId, provider)
    if (status === "pending") {
      await deps.scheduler.schedule({ id: settlementId, transactionId, provider }, { attempt: attempt + 1 })
    }
  }
}
