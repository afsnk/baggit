import { UnderConstruction } from '#/components/under-construction'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/developer/observability')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <UnderConstruction
      title="Observability page under construction"
      description="Get an eagles eye into requests and responses processed using your API keys"
    />
  )
}
