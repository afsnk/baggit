import { payout } from "#/lib/payout";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute('/api/payout/$')({
	server: {
		handlers: {
			POST: ({ request }) => payout.fetch(request),
			GET: ({ request }) => payout.fetch(request),
		}
	}
})
