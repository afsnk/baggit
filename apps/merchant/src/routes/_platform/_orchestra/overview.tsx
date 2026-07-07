import { EmptyOrg } from '#/components/no-org'
import { UnderConstruction } from '#/components/under-construction'
import { authClient } from '#/lib/auth-client'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_platform/_orchestra/overview')({
  component: RouteComponent,
  // loader: async () => {
  //   const { data: orgList, error } = await authClient.organization.list()

  //   if (error) {
  //     console.log(`Error listing orgs`, { error })
  //   }
  //   return orgList
  // },
})

function RouteComponent() {
  const { data: orgList } = authClient.useListOrganizations()

  console.log(`Org list`, { orgList })

  if (!orgList) {
    return (
      <div className="w-full flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (!orgList?.length) {
    return <EmptyOrg />
  }

  return (
    <UnderConstruction
      title="Overview page is still under contruction"
      description="You can get an overview of how well your organizations payments and widget integrations are doing"
    />
  )
}
