import { env } from '#/env'
import type { APIApp } from '@baggit/api/app'
import { treaty } from '@elysia/eden'

export const api = treaty<APIApp>(env.SERVER_URL)
