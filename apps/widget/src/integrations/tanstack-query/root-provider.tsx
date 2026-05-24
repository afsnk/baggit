import { QueryClient } from '@tanstack/react-query'

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        throwOnError: false, // Global throw for all queries
      },
    },
  })

  return {
    queryClient,
  }
}
export default function TanstackQueryProvider() {}
