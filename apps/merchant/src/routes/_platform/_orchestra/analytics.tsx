import { UnderConstruction } from '#/components/under-construction'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/_orchestra/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <UnderConstruction
      title="Analytics page is still under construction"
      description="Dive deeper with clear and precise analytics collected from user interaction with your integrations"
    />
  )
}
