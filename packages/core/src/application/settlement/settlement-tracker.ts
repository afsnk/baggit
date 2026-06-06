import type { Settlement, SettlementStatus } from "../../domain/entities/settlement.entity"
import type { EventBusPort } from "../../ports/event-bus.port"
import type { CachePort } from "../../ports/cache.port"
import { v4 as uuid } from "../../utils/id"

export interface SettlementConfig {
  pollingIntervalMs: number
  maxPollingAttempts: number
  pollingTimeoutMs: number
}

const DEFAULT_CONFIG: SettlementConfig = {
  pollingIntervalMs: 5_000,
  maxPollingAttempts: 60,
  pollingTimeoutMs: 300_000,
}

export class SettlementTracker {
  private eventBus?: EventBusPort
  private cache?: CachePort
  private config: SettlementConfig
  private activePolling = new Map<string, ReturnType<typeof setInterval>>()

  constructor(
    deps?: { eventBus?: EventBusPort; cache?: CachePort },
    config?: Partial<SettlementConfig>,
  ) {
    this.eventBus = deps?.eventBus
    this.cache = deps?.cache
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  async track(settlement: Settlement): Promise<void> {
    if (this.eventBus) {
      await this.eventBus.emit("SettlementStarted", {
        settlementId: settlement.id,
        transactionId: settlement.transactionId,
        provider: settlement.provider,
        timestamp: new Date().toISOString(),
      })
    }
  }

  startPolling(
    txId: string,
    providerName: string,
    checkStatus: (txId: string) => Promise<SettlementStatus>,
  ): void {
    if (this.activePolling.has(txId)) return

    let attempts = 0

    const poll = async () => {
      if (attempts >= this.config.maxPollingAttempts) {
        this.stopPolling(txId)
        return
      }
      attempts++

      try {
        const status = await checkStatus(txId)
        if (status === "completed") {
          this.stopPolling(txId)
          if (this.eventBus) {
            await this.eventBus.emit("SettlementCompleted", {
              settlementId: uuid(),
              transactionId: txId,
              provider: providerName,
              durationMs: attempts * this.config.pollingIntervalMs,
              timestamp: new Date().toISOString(),
            })
          }
        } else if (status === "failed" || status === "timed_out") {
          this.stopPolling(txId)
          if (this.eventBus) {
            await this.eventBus.emit("SettlementFailed", {
              settlementId: uuid(),
              transactionId: txId,
              provider: providerName,
              failureReason: `Settlement ${status}`,
              attempts,
              timestamp: new Date().toISOString(),
            })
          }
        }
      } catch {
        this.stopPolling(txId)
      }
    }

    const timer = setInterval(poll, this.config.pollingIntervalMs)
    this.activePolling.set(txId, timer)
  }

  stopPolling(txId: string): void {
    const timer = this.activePolling.get(txId)
    if (timer) {
      clearInterval(timer)
      this.activePolling.delete(txId)
    }
  }

  stopAll(): void {
    for (const [txId] of this.activePolling) {
      this.stopPolling(txId)
    }
  }
}
