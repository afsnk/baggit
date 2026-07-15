import { authClient } from '#/lib/auth-client'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getRequest } from '@tanstack/react-start/server'

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: async () => {
    // TODO: check session before redirecting to auth
    const request = getRequest()
    const { data, error } = await authClient.getSession({
      fetchOptions: {headers: request.headers}
    })

    if (error) {
      console.log(`Failed to validate sesssion`, { error })
      throw redirect({
        to: '/auth'
      })
    }

    if (!data) {
      throw redirect({
        href: '/auth',
      })
    } else {
      throw redirect({
        to: "/overview"
      })
    }
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
