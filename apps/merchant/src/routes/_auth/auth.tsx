import { Container, Main, Section } from '#/components/craft'
import { LoginForm } from '#/components/login-form'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { createFileRoute } from '@tanstack/react-router'
import { InfoIcon } from 'lucide-react'
import { z } from 'zod'

export const Route = createFileRoute('/_auth/auth')({
  component: RouteComponent,
  validateSearch: z.object({
    status: z.enum(['failed', 'success']).optional(),
    message: z.string().optional(),
  }),
})

function RouteComponent() {
  const { status, message } = Route.useSearch()

  // if (status === 'failed') {
  //   return (
  //     <Main>
  //       <Section className="min-h-svh flex flex-col items-center justify-center">
  //         <Container className="flex flex-col w-full max-w-md items-center">
  //           <h3 className="font-bold text-sm text-center">
  //
  //           </h3>
  //         </Container>
  //       </Section>
  //     </Main>
  //   )
  // }

  return (
    <Main>
      <Section className="min-h-svh flex flex-col items-center justify-center">
        <Container className="flex flex-col w-full max-w-md items-center space-y-2">
          <h3 className="font-bold text-sm text-center">
            Baggit Merchant Dashboard
          </h3>
          {status === 'failed' && (
            <Alert variant="destructive">
              <InfoIcon />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                {message ??
                  'Authentication failed or canceled by user. Please try again.'}
              </AlertDescription>
            </Alert>
          )}
          <LoginForm />
        </Container>
      </Section>
    </Main>
  )
}
