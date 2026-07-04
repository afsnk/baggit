import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/_orchestra/audit-logs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_platform/audit-logs"!</div>
}
