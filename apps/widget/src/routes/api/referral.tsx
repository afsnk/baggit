import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/api/referral')({
  validateSearch: (search) => referralSchema.parse(search),
  server: {
    handlers: {
      GET: async ({ request }) => {
        const ref_code = new URL(request.url).searchParams.get('ref_code')
        return Response.json({ ref_code })
      },
    },
  },
})

const referralSchema = z.object({
  ref_code: z.string(),
})
