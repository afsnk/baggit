import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/r/')({
  loader: () => {
    throw redirect({
      href: `https://baggit.link/billing`,
    })
  },
})
