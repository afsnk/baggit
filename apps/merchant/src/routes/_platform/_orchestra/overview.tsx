import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/_orchestra/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/overview"!</div>
}
