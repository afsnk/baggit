import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/developer/permissions')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_platform/developer/permissions"!</div>
}
