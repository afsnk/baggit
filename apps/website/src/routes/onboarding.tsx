import { Container, Section } from '#/components/craft'
import { Onboarding04 } from '#/components/onboarding-04'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/onboarding')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Section>
      <Container>
        <Onboarding04 />
      </Container>
    </Section>
  )
}
