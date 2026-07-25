import { LinkedAccounts } from '#/components/auth/settings/security/linked-accounts'
import { UserInvitations } from '#/components/auth/organization/user-invitations'
import { createFileRoute } from '@tanstack/react-router'
import { OrganizationDangerZone } from '#/components/auth/organization/organization-danger-zone'

export const Route = createFileRoute('/_platform/settings/general')({
  beforeLoad: () => ({ isUnderConstruction: true }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="grid gap-4">
      <LinkedAccounts />

			<UserInvitations />

			<OrganizationDangerZone />
    </div>
  )
}
