import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/_orchestra/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_platform/analytics"!</div>
}
