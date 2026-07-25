import { OrganizationInvitations } from '#/components/auth/organization/organization-invitations'
import { OrganizationMembers } from '#/components/auth/organization/organization-members'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/settings/team')({
	beforeLoad: () => ({isUnderConstruction: true}),
  component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className='grid gap-4 overflow-x-auto'>
			<OrganizationMembers />

			<OrganizationInvitations />

		</div>
  )
}
