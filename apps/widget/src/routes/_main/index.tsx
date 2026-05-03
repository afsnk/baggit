import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '#/components/ui/item'
import { Skeleton } from '#/components/ui/skeleton'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRightIcon, Minus, Plus, Wallet } from 'lucide-react'
import React from 'react'
import z from 'zod'
import SigninModal from './-components/signin-modal'
import { Button } from '#/components/ui/button'
import { authClient } from '#/lib/auth-client'
import { Spinner } from '#/components/ui/spinner'

export const Route = createFileRoute('/_main/')({
  component: App,
  validateSearch: (search) => searchSchema.parse(search),
  errorComponent: ({ error }) => (
    <div className="grid w-full items-center p-12">
      <pre className="max-w-lg p-6 bg-muted line-clamp-2 min-h-[450px] mx-auto">
        {JSON.stringify({ message: JSON.parse(error.message) }, null, 3)}
      </pre>
    </div>
  ),
  pendingComponent: AppSkeleton,
})

function App() {
  const { isPending, data } = authClient.useSession()

  if (isPending)
    return (
      <div className="mx-auto my-[45%] flex flex-col items-center justify-center">
        <Spinner />
        <span>Loading user data...</span>
      </div>
    )

  return (
    <div className="grid gap-2 pt-12">
      <h2 className="text-xl font-semibold text-white">Welcome to baggit</h2>
      <span>Login to unlock the full experience</span>
      {!data && (
        <SigninModal>
          <Button size="xs" variant="default" className="w-14 px-2">
            Sign in
          </Button>
        </SigninModal>
      )}

      <div className="my-6" />

      <ItemGroup>
        <Item variant="outline" size="sm" asChild>
          <Link to="/buy">
            <ItemMedia>
              <Plus className="size-5" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Buy</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ChevronRightIcon className="size-4" />
            </ItemActions>
          </Link>
        </Item>
        <Item variant="outline" size="sm" asChild>
          <Link to="/sell">
            <ItemMedia>
              <Minus className="size-5" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Sell</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ChevronRightIcon className="size-4" />
            </ItemActions>
          </Link>
        </Item>
        <Item variant="outline" size="sm" asChild>
          <Link to="/wallet">
            <ItemMedia>
              <Wallet className="size-5" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Wallet</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ChevronRightIcon className="size-4" />
            </ItemActions>
          </Link>
        </Item>
      </ItemGroup>
    </div>
  )
}

function AppSkeleton() {
  return (
    <div className="w-fit flex items-center gap-4">
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </div>
  )
}

const searchSchema = z.object({
  apiKey: z.string(),
  signature: z.string(),
  currencyCode: z.string().optional(), // country currency code
  userSendsFund: z
    .boolean()
    .optional()
    .describe('Enables meerchants to send funds on behalf of users'),
})
