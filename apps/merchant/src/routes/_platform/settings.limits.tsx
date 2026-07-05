import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/settings/limits')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_platform/settings/limits"!</div>
}
