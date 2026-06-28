import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/settings/general')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_platform/settings/general"!</div>
}
