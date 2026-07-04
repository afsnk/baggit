import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/developer/api-keys')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_platform/developer/api-keys"!</div>
}
