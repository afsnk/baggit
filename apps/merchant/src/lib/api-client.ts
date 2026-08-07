import { env } from '#/env'
import { getBanks, lookupBank } from '#/server/api'
import type { APIApp } from '@baggit/api/app'
import { edenFetch } from '@elysia/eden'
import { mutationOptions, QueryClient, queryOptions } from '@tanstack/react-query'

const queryClient = new QueryClient()

// jwtClient.ts  (browser)
// let cached: { token: string; expMs: number } | null = null;

// const SKEW_MS = 15_000; // re-mint 15s early

// function decodeExp(jwt: string): number {
//   const [, payload] = jwt.split(".");
//   const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
//   return exp * 1000;
// }

// async function mint(): Promise<{ token: string; expMs: number }> {
  // cookie-based session is sent automatically with credentials: "include"
//   const res = await fetch("/api/auth/token", { credentials: "include" });
//   if (!res.ok) throw new Error(`token mint failed: ${res.status}`);
//   const { token } = await res.json();
//   return { token, expMs: decodeExp(token) };
// }

// async function getToken(): Promise<string> {
//   const now = Date.now();
//   if (cached && now < cached.expMs - SKEW_MS) return cached.token;
//   cached = await mint();
//   return cached.token;
// }

// Use this for every call to the protected API.
// export async function apiFetch(input: string, init: RequestInit = {}) {
//   const token = await getToken();
//   const res = await fetch(input, {
//     ...init,
//     headers: { ...init.headers, Authorization: `Bearer ${token}` },
//   });

//   // token rejected mid-flight (e.g. rotated key) -> mint once and retry
//   if (res.status === 401) {
//     cached = null;
//     const fresh = await getToken();
//     return fetch(input, {
//       ...init,
//       headers: { ...init.headers, Authorization: `Bearer ${fresh}` },
//     });
//   }
//   return res;
// }


export const fetch = edenFetch<APIApp>(env.VITE_API_URL, {
  credentials: "include"
})

export const getTransactions =
  queryOptions({
    queryKey: ['getTransactions'],
    queryFn: async () => {
      const { data, error } = await fetch(`/v1/transaction/all`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
        credentials: "include",
      })

      if (error) {
        console.log(`Error from init`, { error: JSON.stringify(error, null, 2) })
        throw error
      }

      return data.map((trx) => ({...trx, date: trx.createdAt}))
    },
  })

export const getBalanceOptions = queryOptions({
  refetchOnMount: true,
  retryOnMount: true,
  refetchOnWindowFocus: false,
  staleTime: 30_0000,
  queryKey: ['getBalances'],
  queryFn: async () => {
    const { data, error } = await fetch(`/v1/balance/`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
      credentials: "include",
    })

    if (error) {
      console.log(`Error from init`, { error: JSON.stringify(error, null, 2) })
      throw error
    }

    return data
  },
})

export const clawfundsOptions = queryOptions({
  refetchOnMount: false,
  retryOnMount: false,
  refetchOnWindowFocus: false,
  staleTime: 30_0000,
  queryKey: ['clawFunds'],
  queryFn: async () => {
    const { data, error } = await fetch(`/v1/balance/clawfunds`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
      credentials: "include",
    })

    if (error) {
      console.log(`Error from init`, { error: JSON.stringify(error, null, 2) })
      throw error
    }
    return data
  },
})

export const updatePayment = (paymentId: string) => mutationOptions({
  mutationKey: ['updatePayment', {paymentId}],
  mutationFn: async (values: any) => {
    const { data, error } = await fetch(`/v1/payment/${paymentId}`, {
      method: "POST",
      body: { ...values },
      headers: {
        'Content-type': `application/json`
      }
    })

    if (error) {
      console.log(`Error from init`, { error })
      throw error
    }

    return data
  },
  onSuccess: () => {
    queryClient.invalidateQueries({queryKey: ['getInvoice']})
  }
})

export const checkBank = mutationOptions({
	mutationKey: ['lookupBank'],
	mutationFn: async (values: { bankCode: string; accountNumber: string }) => lookupBank({ data: { ...values } }),
})

export const banks = queryOptions({
	queryKey: ['getBanks'],
	queryFn: async () => await getBanks(),
	refetchOnMount: true,
  retryOnMount: true,
  refetchOnWindowFocus: true,
})
