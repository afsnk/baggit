export interface RetryOptions {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  jitter?: boolean
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const opts: RetryOptions = {
    maxRetries: 3,
    baseDelayMs: 100,
    maxDelayMs: 5_000,
    jitter: true,
    ...options,
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt === opts.maxRetries) break

      const delay = Math.min(
        opts.baseDelayMs * Math.pow(2, attempt),
        opts.maxDelayMs,
      )
      const jitter = opts.jitter ? Math.random() * delay * 0.1 : 0

      await new Promise((resolve) => setTimeout(resolve, delay + jitter))
    }
  }

  throw lastError
}
