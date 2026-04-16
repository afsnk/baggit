import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/sell/$asset')({
  component: RouteComponent,
})

function RouteComponent() {
  const { asset } = useParams({ from: '/sell/$asset' })
  return <div>Hello "/sell/$asset"! {asset}</div>
}
