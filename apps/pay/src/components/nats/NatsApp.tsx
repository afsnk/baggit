import { Suspense } from "react";
import Nats from "@/components/nats/Nats";
import { ErrorBoundary } from "@/components/nats/ErrorBoundary";
import { natsConn } from "@/lib/nats";

export default function NatsApp() {
  // prime all three resources so Suspense doesn't waterfall their fetches.
  natsConn();
  // natsKv();
  // natsObj();

  return (
    <ErrorBoundary
      fallback={(err) => (
        <div>
          <h3>Error Connecting to NATS</h3>
          <p>{err.message}</p>
        </div>
      )}
    >
      <Suspense fallback={<h3>Connecting to NATS...</h3>}>
        <Nats />
      </Suspense>
    </ErrorBoundary>
  );
}
