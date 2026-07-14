import { EmptyOrg } from '#/components/no-org'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from '#/components/ui/item'
import { ScrollArea } from '#/components/ui/scroll-area'
import { UnderConstruction } from '#/components/under-construction'
import { authClient } from '#/lib/auth-client'
import { createFileRoute } from '@tanstack/react-router'
import { BanknoteArrowUp, Building, CheckCircleIcon, Expand, Key, Loader2, LucideArrowUpRightSquare, Users2 } from 'lucide-react'

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

  if (!orgList.length) {
    return <EmptyOrg />
  }

  return (
    <div className='grid gap-6'>
      <UnderConstruction
        isActive
        title="Overview page is currently under contruction"
        description="You can get an overview of how well your organizations payments and widget integrations are doing"
      />
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3 items-center justify-around'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>Checklist <Badge>1/5</Badge></CardTitle>
            <CardAction>
              <Button variant="ghost" size="icon-sm">
                <LucideArrowUpRightSquare className='size-4' />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ScrollArea className='h-36 rounded-sm'>
              <ItemGroup className='gap-2'>
                <Item variant="muted" className='p-1'>
                  <ItemMedia variant="icon">
                    <Building className='size-3' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className='text-xs'>Create Organization</ItemTitle>
                  </ItemContent>
                </Item>
                <Item variant="muted" className='p-1'>
                  <ItemMedia variant="icon">
                    <Users2 className='size-3' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className='text-xs'>Add team members</ItemTitle>
                  </ItemContent>
                </Item>
                <Item variant="muted" className='p-1'>
                  <ItemMedia variant="icon">
                    <Key className='size-3' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className='text-xs'>Create api keys</ItemTitle>
                  </ItemContent>
                </Item>
                <Item variant="muted" className='p-1'>
                  <ItemMedia variant="icon">
                    <CheckCircleIcon className='size-3' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className='text-xs'>Get first transaction</ItemTitle>
                  </ItemContent>
                </Item>
                <Item variant="muted" className='p-1'>
                  <ItemMedia variant="icon">
                    <BanknoteArrowUp className='size-3' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className='text-xs'>Request first payout</ItemTitle>
                  </ItemContent>
                </Item>
              </ItemGroup>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>Observability</CardTitle>
            <CardAction>
              <Button variant="ghost" size="icon-sm">
                <Expand className='size-4' />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>Analytics</CardTitle>
            <CardAction>
              <Button variant="ghost" size="icon-sm">
                <Expand className='size-4' />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
