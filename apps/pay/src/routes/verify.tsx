// import { Container, Main, Section } from '#/components/craft'
import { createFileRoute } from '@tanstack/react-router'
// import { RefreshCwIcon } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   Field,
//   FieldDescription,
//   FieldLabel,
// } from "@/components/ui/field"
// import {
//   InputOTP,
//   InputOTPGroup,
//   InputOTPSeparator,
//   InputOTPSlot,
// } from "@/components/ui/input-otp"
// import {z} from 'zod'
// import { useState } from 'react'
// import { useMutation } from '@tanstack/react-query'
// import { authClient } from '#/lib/auth-client'

import { lazy, Suspense, useEffect, useState } from "react"

export const Route = createFileRoute('/verify')({
  component: RouteComponent,
})

const ClientOnlyNats = lazy(() => import("@/components/nats/NatsApp"))

function RouteComponent() {

  const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted) return null

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ClientOnlyNats />
    </Suspense>
  )
  // const search = Route.useSearch()
  // const router = useRouter()
  // console.log(`Search /verify`, {search})
  // const [otp, setOTP] = useState<string>("")

  // const verifyOTP = useMutation({
  //   mutationKey: ['verifyOTP'],
  //   mutationFn: async (values: {otp: string}) => {
  //     const { data, error} = await authClient.emailOtp.checkVerificationOtp({
  //       email: search.email,
  //       type: "email-verification",
  //       otp: values.otp,
  //     })

  //     if (error) {
  //       console.log(`Failed to verify`, { error })
  //       throw error
  //     }

  //     return data;
  //   },
  //   onSuccess() {
  //     router.navigate({
  //       to: `/r/${search.invoiceRef}`,
  //       replace: true,
  //       resetScroll: true,
  //       search: {
  //         merchantName: search.merchantName,
  //         merchantCallbackUrl: search.merchantCallbackUrl,
  //         email: search.email,
  //         name: search.name,
  //         mode: search.mode
  //       }
  //     })
  //   },
  // })

//   return (
//     <Main>
//       <Section>
//         <Container>
//           <Card className="mx-auto max-w-md">
//             <CardHeader>
//               <CardTitle>Verify your email to continue with payment</CardTitle>
//               <CardDescription>
//                 Enter the verification code we sent to your email address:{" "}
//                 <span className="font-medium">{search.email}</span>.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Field>
//                 <div className="flex items-center justify-between">
//                   <FieldLabel htmlFor="otp-verification">
//                     Verification code
//                   </FieldLabel>
//                   <Button variant="outline" size="sm" className='gap-1' onClick={async () => {
//                     const {data, error } = await authClient.emailOtp.sendVerificationOtp({
//                       email: search.email,
//                       type: "email-verification"
//                     })

//                     if (error) {
//                       console.error(`Fialed to send code`,{error})
//                     } else {
//                       console.log(`Data`, {data})
//                     }

//                   }}>
//                     <RefreshCwIcon className='size-4' />
//                     Resend Code
//                   </Button>
//                 </div>
//                 <InputOTP maxLength={6} id="otp-verification" required value={otp} onChange={setOTP}>
//                   <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
//                     <InputOTPSlot index={0} />
//                     <InputOTPSlot index={1} />
//                     <InputOTPSlot index={2} />
//                   </InputOTPGroup>
//                   <InputOTPSeparator className="mx-2" />
//                   <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
//                     <InputOTPSlot index={3} />
//                     <InputOTPSlot index={4} />
//                     <InputOTPSlot index={5} />
//                   </InputOTPGroup>
//                 </InputOTP>
//                 <FieldDescription>
//                   <a href="#">I no longer have access to this email address.</a>
//                 </FieldDescription>
//               </Field>
//             </CardContent>
//             <CardFooter>
//               <Field>
//                 <Button type="submit" className="w-full" disabled={verifyOTP.isPending} onClick={() => {
//                   console.log(`OTP`, { otp })
//                   verifyOTP.mutate({
//                     otp,
//                   })
//                 }}>
//                   Verify
//                 </Button>
//                 <div className="text-sm text-muted-foreground">
//                   Having trouble signing in?{" "}
//                   <a
//                     href="#"
//                     className="underline underline-offset-4 transition-colors hover:text-primary"
//                   >
//                     Contact support
//                   </a>
//                 </div>
//               </Field>
//             </CardFooter>
//           </Card>
//         </Container>
//       </Section>
//     </Main>
//   )
}
