import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
// import { StablecoinPaymentModal } from "@/components/StablecoinPaymentModal";
import { StablePayModal } from "../../registry/default/afsnk/stablecoin-payment/stablecoin-payment-modal";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/payment")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const paymentRef = useRef<string>(null);

  useEffect(() => {
    setTimeout(() => {
      paymentRef.current = crypto.randomUUID();
      // Handle wallet connection logic here
      console.log("Wallet connection initiated", paymentRef.current);
    }, 100);
  }, []);

  useEffect(() => {
    console.log("Payment ref", paymentRef.current);
  }, [paymentRef.current]);

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Payment</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          A small payemnt modal.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          A small payment modal to collect and confirm payment
        </p>
      </section>
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <Button onClick={() => setIsOpen(true)}>
          Continue to payment of $0.06
        </Button>
        <StablePayModal
          apiUrl={
            import.meta.env.DEV
              ? "http://localhost:9999"
              : "https://afsnk-pay-server.fly.dev"
          }
          callbackUrl="https://api-staging.ugamy.io/webhook/coinley"
          reference={paymentRef.current}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          amount={0.06}
        />
      </section>
    </main>
  );
}
