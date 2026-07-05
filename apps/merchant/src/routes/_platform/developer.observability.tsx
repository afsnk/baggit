import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/developer/observability')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_platform/developer/observability"!</div>
}
