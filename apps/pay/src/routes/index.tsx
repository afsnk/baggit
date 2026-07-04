import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  loader: () => {
    return redirect({
      href: 'https://baggit.link',
    })
  },
})
