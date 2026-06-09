import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(wallet)/wallet')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/wallet_"!</div>
}
