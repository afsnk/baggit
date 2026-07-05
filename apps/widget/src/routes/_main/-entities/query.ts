import { z } from 'zod'

export const searchQuery = z.object({
  layout: z.enum(['compact', 'full']).default('compact'),
})
