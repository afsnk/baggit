export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: "closed" | "open" | "half-open" = "closed"

  constructor(
    private readonly name: string,
    private readonly threshold = 5,
    private readonly resetTimeoutMs = 30_000,
    private readonly halfOpenMaxRequests = 3,
  ) {}

  getState(): string {
    return this.state
  }

  isOpen(): boolean {
    if (this.state === "open") {
      const elapsed = Date.now() - this.lastFailureTime
      if (elapsed >= this.resetTimeoutMs) {
        this.state = "half-open"
      }
    }
    return this.state === "open"
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error(`Circuit breaker is OPEN for ${this.name}`)
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  onSuccess(): void {
    this.failures = 0
    this.state = "closed"
  }

  onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    if (this.failures >= this.threshold) {
      this.state = "open"
    }
  }

  reset(): void {
    this.failures = 0
    this.state = "closed"
  }
}
