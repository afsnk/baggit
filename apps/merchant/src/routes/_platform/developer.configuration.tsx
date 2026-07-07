import { UnderConstruction } from '#/components/under-construction'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/developer/configuration')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <UnderConstruction
      title="Configurations page under construction"
      description="Fine tune access control, transaction limits, and control what your API keys can do."
    />
  )
}
