import { OrganizationInvitations } from '#/components/auth/organization/organization-invitations'
import { OrganizationMembers } from '#/components/auth/organization/organization-members'
// import { authClient } from '#/lib/auth-client'

import { createFileRoute } from '@tanstack/react-router'
// import { useEffect, useRef } from 'react'

export const Route = createFileRoute('/_platform/settings/team')({
	beforeLoad: () => ({isUnderConstruction: true}),
  component: RouteComponent,
})

function RouteComponent() {
	// const activeOrg = authClient.useActiveOrganization()
	// const orgRef = useRef<string | null>(null)

	// useEffect(() => {
	// 	if (typeof window !== "undefined" && activeOrg.data && !orgRef.current && activeOrg.data.id !== orgRef.current) {
	// 		console.log(`Reload page on activeOrg change`)
	// 		window.location.reload()
	// 	}
	// }, [activeOrg])

	return (
		<div className='grid gap-4 overflow-x-auto'>
			<OrganizationMembers />

			<OrganizationInvitations />
		</div>
  )
}
