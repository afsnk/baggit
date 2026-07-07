import { UnderConstruction } from '#/components/under-construction'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/_orchestra/audit-logs')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <UnderConstruction
      title="Audit Logs page under construction"
      description="Track what you or your team members are up to in your organization"
    />
  )
}
