
type RetryOptions = {
  retries: number;
  delayMs: number;
};

// Custom wrapper to add retry and abort functionality
export async function runWithRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  { retries, delayMs }: RetryOptions,
  signal?: AbortSignal
): Promise<T> {

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Check if already aborted before attempting
      if (signal?.aborted) throw new Error("Aborted");

      // Pass the signal to the operation
      return await fn(signal!);
    } catch (error) {
      const isLastAttempt = attempt === retries;
      // If aborted, don't retry, just throw immediately
      if (signal?.aborted || isLastAttempt) throw error;

      // Exponential backoff or simple delay
      await new Promise((resolve) =>
        setTimeout(resolve, delayMs * Math.pow(2, attempt))
      );
    }
  }
  throw new Error("Failed after retries");
}
