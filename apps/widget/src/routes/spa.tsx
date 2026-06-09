import { createFileRoute, createRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/spa')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl min-h-[500px] p-6 sm:p-8">
        <iframe
          src="http://localhost:3000/"
          title="Embedded home content in about page."
          style={{
            width: '100%',
            height: '500px',
            border: '1px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          allow="accelerometer; autoplay; camera; encrypted-media; gyroscope; payment; clipboard-read; clipboard-write"
        ></iframe>
      </section>
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <Outlet />
      </section>
    </main>
  )
}

const playRoute = createRoute({
  path: '/play',
  component: () => (
    <div>
      <h1>Sub component</h1>
    </div>
  ),
  getParentRoute: () => Route,
})

Route.addChildren([playRoute])
