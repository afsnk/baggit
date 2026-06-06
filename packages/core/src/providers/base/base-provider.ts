import type { ProviderPort } from "../../ports/provider.port"
import type {
  ProviderCapabilities,
  ProviderHealth,
} from "../../domain/contracts/provider-contract"
import type { QuoteRequest, ProviderQuote } from "../../domain/entities/quote.entity"
import type { Transaction, TransactionRequest } from "../../domain/entities/transaction.entity"
import type { SettlementStatus } from "../../domain/entities/settlement.entity"
import { CircuitBreaker } from "../../utils/circuit-breaker"

export abstract class BaseProvider implements ProviderPort {
  abstract readonly name: string
  abstract readonly capabilities: ProviderCapabilities

  protected circuitBreaker: CircuitBreaker
  protected successCount = 0
  protected failureCount = 0
  protected totalResponseTime = 0
  protected responseCount = 0
  protected startTime = Date.now()

  constructor() {
    this.circuitBreaker = new CircuitBreaker("provider")
  }

  abstract isAvailable(region: string): Promise<boolean>
  abstract quote(request: QuoteRequest): Promise<ProviderQuote>
  abstract initiate(request: TransactionRequest): Promise<Transaction>
  abstract status(txId: string): Promise<SettlementStatus>

  async health(): Promise<ProviderHealth> {
    const uptime = (Date.now() - this.startTime) / 1000
    const total = this.successCount + this.failureCount
    return {
      status: this.circuitBreaker.isOpen() ? "down" : "active",
      uptime,
      lastChecked: new Date(),
      failureRate: total > 0 ? this.failureCount / total : 0,
      avgResponseTime:
        this.responseCount > 0
          ? this.totalResponseTime / this.responseCount
          : 0,
    }
  }

  protected trackSuccess(responseTime: number): void {
    this.successCount++
    this.totalResponseTime += responseTime
    this.responseCount++
  }

  protected trackFailure(): void {
    this.failureCount++
    this.circuitBreaker.onFailure()
  }
}
