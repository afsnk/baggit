import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/buy/$asset')({
  component: RouteComponent,
})

function RouteComponent() {
  const { asset } = useParams({ from: '/buy/$asset' })
  return <div>Hello "/buy/$asset"! {asset}</div>
}
