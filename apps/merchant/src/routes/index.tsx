import { authClient } from '#/lib/auth-client'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
  loader: () => {
    // TODO: check session before redirecting to auth
    throw redirect({
      href: '/auth',
    })
  },
})

function Home() {
  const { data: session, isPending } = authClient.useSession()

  console.log(`Session`, { session, isPending })
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <p className="mt-4 text-lg">
        removing this entire thing cos of this please
      </p>
    </div>
  )
}
