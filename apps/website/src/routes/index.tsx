import { Container, Main, Section } from '#/components/craft'
import { CallToAction } from '#/components/cta'
import { FeatureSection } from '#/components/feature-section'
import { HeroSection } from '#/components/hero'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <Section>
      <Container className="">
        <HeroSection />
        <FeatureSection />
        <CallToAction />
      </Container>
    </Section>
  )
}
