import { QueryClient } from '@tanstack/react-query'

export function getContext() {
  const queryClient = new QueryClient()

  return {
    queryClient,
    isUnderConstruction: false,
  }
}

export interface MyRouterContext {
  queryClient: QueryClient,
  isUnderConstruction: boolean
}
export default function TanstackQueryProvider() {}
