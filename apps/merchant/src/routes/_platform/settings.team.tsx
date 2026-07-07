import { UnderConstruction } from '#/components/under-construction'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/settings/team')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <UnderConstruction
      title="Teams page under construction"
      description="Invite, remove and update roles for your team members."
    />
  )
}
