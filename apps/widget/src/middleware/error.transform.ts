import { createMiddleware } from '@tanstack/react-start'
import { ValidationError, AuthError, NotFoundError, ApiError } from '../errors'

interface MiddlewareResult {
  error?: unknown
}

export const errorTransformMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const result = await next()
  const { error } = result as MiddlewareResult

  if (!error) return result

  // Already one of our typed errors — pass through
  if (
    error instanceof ValidationError ||
    error instanceof AuthError ||
    error instanceof NotFoundError ||
    error instanceof ApiError
  ) {
    return result
  }

  // Map raw HTTP/fetch responses (e.g. from an external API SDK)
  if (error instanceof Response) {
    ;(result as MiddlewareResult).error = new ApiError(
      'Upstream API error',
      error.status,
    )
    return result
  }

  // Map Prisma / DB not-found
  if (
    error instanceof Error &&
    error.message.includes('Record to update not found')
  ) {
    ;(result as MiddlewareResult).error = new NotFoundError(
      error.message,
      'record',
    )
    return result
  }

  // Anything else: wrap as a generic ApiError so it still serializes cleanly
  if (error instanceof Error) {
    ;(result as MiddlewareResult).error = new ApiError(error.message, 500)
  }

  return result
})
