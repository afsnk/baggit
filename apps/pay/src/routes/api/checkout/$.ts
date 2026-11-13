import { checkout } from "#/lib/checkout";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute('/api/checkout/$')({
	server: {
		handlers: {
			GET: ({ request }) => {
				console.log(`request data`, request.method, request.url)
				return checkout.fetch(request)
			},
			POST: ({ request }) => checkout.fetch(request),
		}
	}
})
