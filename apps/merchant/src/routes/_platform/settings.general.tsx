import { UnderConstruction } from '#/components/under-construction'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/settings/general')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <UnderConstruction
      title="General settings page under construction"
      description="Change the look and feel of your dashboard for improved productivity"
    />
  )
}
