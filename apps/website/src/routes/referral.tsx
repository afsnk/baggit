import { Container, Section } from '#/components/craft'
import { HeroSection } from '#/components/ui/hero-section-shadcnui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/referral')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Section>
      <Container>
        <HeroSection />
      </Container>
    </Section>
  )
}
