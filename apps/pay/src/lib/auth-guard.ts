import { createServerFn } from "@tanstack/react-start";
import {getRequest} from "@tanstack/react-start/server"
import { authClient } from "./auth-client";
import { redirect } from "@tanstack/react-router";
import {z} from "zod";


export const authGuard = createServerFn()
  .validator(z.object({
    email: z.email(),
    name: z.string(),
    merchantName: z.string(),
    merchantCallbackUrl: z.string(),
    invoiceRef: z.string(),
    mode: z.enum(['test', 'prod']).optional()
  }))
  .handler(async ({data}) => {
    const cookie = getRequest().headers.get('cookie') ?? ''
    const { data: session, error } = await authClient.getSession({
      fetchOptions: { headers: { cookie } },
    })

    if (error) {
      console.log(`Failed to fetch session`, { error })
    }

    if (!session) {
      console.log(`Email`, data)
      throw redirect({
        to: `/verify`,
        search: (prev) => ({
          ...prev,
          ...data,
          // email: data.email,
          // name: data.name,
        }),
      })
    }

    return session
  })
