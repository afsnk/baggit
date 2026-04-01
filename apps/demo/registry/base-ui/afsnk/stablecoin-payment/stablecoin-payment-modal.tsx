import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  CheckCircle,
  Clock,
  Copy,
  InfoIcon,
  Send,
  Wallet,
  X,
} from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { betterFetch } from "@better-fetch/fetch";
import { defineStepper } from "@stepperize/react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import QRCode from "react-qr-code";
import { Spinner } from "@/components/ui/spinner";
import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { InsertTransaction } from "@afsnk/pay-server/types";

// ─── Stepper ─────────────────────────────────────────────────────────────────

const { useStepper } = defineStepper(
  { id: "step-1", title: "Choose Asset" },
  { id: "step-2", title: "Send Deposit" },
);

// ─── Constants ────────────────────────────────────────────────────────────────

const NETWORKS = [
  { id: "base", name: "Base", symbol: "BASE" },
  { id: "bsc", name: "Binance Smart Chain", symbol: "BSC" },
] as const;

const STABLECOINS = [
  { id: "usdc", name: "USDC", symbol: "USDC" },
  { id: "usdt", name: "Tether", symbol: "USDT" },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface StablecoinPaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentFinished: (result: any) => void;
  onPaymentFailed: (error: any) => void;
  amount?: number;
  currency?: string;
  apiUrl: string;
  callbackUrl: string;
  reference?: string | null;
  metadata?: Record<string, any>;
  onConnect?: () => void | Promise<void>;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
// Consolidating the 5 scattered useState calls into a single useReducer.
// Grouping logically related state transitions (e.g. changing the network/coin
// also resets `copied` and `paymentMade`) prevents stale state bugs that arise
// when each setState call lands in a separate micro-task.

type PaymentState = {
  selectedNetwork: string;
  selectedStablecoin: string;
  paymentAddress: string;
  copied: boolean;
  paymentMade: boolean;
};

type PaymentAction =
  | { type: "SET_NETWORK"; payload: string }
  | { type: "SET_STABLECOIN"; payload: string }
  | { type: "SET_ADDRESS"; payload: string }
  | { type: "COPY_ADDRESS" }
  | { type: "COPY_ADDRESS_CLEAR" }
  | { type: "PAYMENT_MADE" }
  | { type: "PAYMENT_MADE_CLEAR" }
  | { type: "RESET_SELECTION" }; // keeps network/coin, wipes transient flags

const initialState: PaymentState = {
  selectedNetwork: "base",
  selectedStablecoin: "usdc",
  paymentAddress: "",
  copied: false,
  paymentMade: false,
};

function paymentReducer(
  state: PaymentState,
  action: PaymentAction,
): PaymentState {
  switch (action.type) {
    // Changing asset resets copy & payment-made flags atomically
    case "SET_NETWORK":
      return {
        ...state,
        selectedNetwork: action.payload,
        copied: false,
        paymentMade: false,
      };
    case "SET_STABLECOIN":
      return {
        ...state,
        selectedStablecoin: action.payload,
        copied: false,
        paymentMade: false,
      };
    case "SET_ADDRESS":
      return { ...state, paymentAddress: action.payload };
    case "COPY_ADDRESS":
      return { ...state, copied: true };
    case "COPY_ADDRESS_CLEAR":
      return { ...state, copied: false };
    case "PAYMENT_MADE":
      return { ...state, paymentMade: true };
    case "PAYMENT_MADE_CLEAR":
      return { ...state, paymentMade: false };
    // Full reset of transient flags (called after success/failure/timeout)
    case "RESET_SELECTION":
      return {
        ...state,
        copied: false,
        paymentMade: false,
        paymentAddress: "",
      };
    default:
      return state;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StablePayModal({
  amount,
  isOpen,
  onOpenChange,
  onPaymentFinished,
  onPaymentFailed,
  currency,
  apiUrl,
  callbackUrl,
  reference,
  metadata,
  onConnect,
}: StablecoinPaymentModalProps) {
  const [state, dispatch] = useReducer(paymentReducer, initialState);
  const {
    selectedNetwork,
    selectedStablecoin,
    paymentAddress,
    copied,
    paymentMade,
  } = state;

  const stepper = useStepper();

  // ── Stabilise parent callbacks ──────────────────────────────────────────────
  // If the parent component re-renders and passes a new function reference for
  // `onPaymentFinished` / `onPaymentFailed`, a naïve useEffect dependency on
  // those props would fire the effect (and therefore the callback) again on
  // every parent render. We store the *latest* version in a ref and expose a
  // stable wrapper so effect dependency arrays can safely include it.
  const onPaymentFinishedRef = useRef(onPaymentFinished);
  const onPaymentFailedRef = useRef(onPaymentFailed);
  useEffect(() => {
    onPaymentFinishedRef.current = onPaymentFinished;
  }, [onPaymentFinished]);
  useEffect(() => {
    onPaymentFailedRef.current = onPaymentFailed;
  }, [onPaymentFailed]);

  const stableOnPaymentFinished = useCallback((result: any) => {
    onPaymentFinishedRef.current(result);
  }, []); // empty deps – intentionally stable for the lifetime of the component

  const stableOnPaymentFailed = useCallback((error: any) => {
    onPaymentFailedRef.current(error);
  }, []);

  // ── Guard ref ───────────────────────────────────────────────────────────────
  // Prevents onPaymentFinished / onPaymentFailed from being called more than
  // once per payment attempt even if the query triggers multiple re-renders.
  const callbackFiredRef = useRef(false);

  // ── Payment init mutation ───────────────────────────────────────────────────
  const paymentInit = useMutation<{
    status: string;
    amount: number;
    address: string;
  }>({
    mutationKey: [
      "payment",
      "init",
      selectedNetwork,
      selectedStablecoin,
      reference,
    ],
    mutationFn: async (values: InsertTransaction) => {
      const { data, error } = await betterFetch<{
        address: string;
        status: string;
        amount: number;
      }>(`${apiUrl}/payment/init`, { body: values });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      dispatch({ type: "SET_ADDRESS", payload: data?.address });
      stepper.navigation.goTo("step-2");
    },
  });

  // ── Payment confirm query ───────────────────────────────────────────────────
  const paymentConfirm = useQuery({
    queryKey: ["payment", "confirm", reference],
    queryFn: async () => {
      const { data, error } = await betterFetch<any>(
        `${apiUrl}/payment/confirm/${reference}`,
      );
      if (error) throw error;
      return data;
    },
    enabled: paymentMade,
    // Do not re-fetch automatically – we only want this to run once per
    // explicit user action (clicking "I have made payment").
    retry: false,
    refetchOnWindowFocus: false,
  });

  // ── Handle confirm result ───────────────────────────────────────────────────
  // BUG FIX: The original dependency array included the entire `paymentConfirm`
  // object. Because React Query creates a new object reference on every render,
  // this caused the effect – and therefore the callbacks – to fire on *every*
  // parent re-render rather than only when data/error actually changed.
  //
  // Fix 1: Depend only on the stable primitive values (.data / .error).
  // Fix 2: callbackFiredRef ensures we call the prop at most once per attempt.
  // Fix 3: Reset the guard when a new payment attempt starts (paymentMade → true).
  useEffect(() => {
    if (!paymentConfirm.data && !paymentConfirm.error) return;
    if (callbackFiredRef.current) return; // ← guard against double-fire

    callbackFiredRef.current = true;

    if (paymentConfirm.data) {
      stableOnPaymentFinished(paymentConfirm.data);
    } else if (paymentConfirm.error) {
      stableOnPaymentFailed(paymentConfirm.error);
    }

    // Reset UI back to step 1
    stepper.navigation.goTo("step-1");
    paymentInit.reset();
    dispatch({ type: "RESET_SELECTION" });
  }, [paymentConfirm.data, paymentConfirm.error]); // ← stable primitives only

  // Reset the guard when user triggers a new payment attempt
  useEffect(() => {
    if (paymentMade) {
      callbackFiredRef.current = false;
    }
  }, [paymentMade]);

  // Reset mutation when asset/network changes
  useEffect(() => {
    paymentInit.reset();
  }, [selectedNetwork, selectedStablecoin]);

  // ── Stable handlers ─────────────────────────────────────────────────────────
  // Wrapped in useCallback so that memoised child components (ConfigSelect,
  // Deposit) do not re-render when unrelated state in this component changes.

  const handleCopyAddress = useCallback(() => {
    const address = paymentInit.data?.address ?? paymentAddress;
    if (!address) return;
    navigator.clipboard.writeText(address);
    dispatch({ type: "COPY_ADDRESS" });
    setTimeout(() => dispatch({ type: "COPY_ADDRESS_CLEAR" }), 2000);
  }, [paymentInit.data?.address, paymentAddress]);

  const handlePaymentMade = useCallback(() => {
    dispatch({ type: "PAYMENT_MADE" });
  }, []);

  const handleTimerEnd = useCallback(() => {
    paymentInit.reset();
    dispatch({ type: "RESET_SELECTION" });
    stepper.navigation.goTo("step-1");
  }, [paymentInit, stepper.navigation]);

  const handleNetworkSelect = useCallback((value: string) => {
    dispatch({ type: "SET_NETWORK", payload: value });
  }, []);

  const handleAssetSelect = useCallback((value: string) => {
    dispatch({ type: "SET_STABLECOIN", payload: value });
  }, []);

  const convertedAmount = useMemo(
    () => (amount ? Math.ceil(amount / 1365) : 0),
    [amount],
  );

  return (
    <Credenza
      open={isOpen}
      onOpenChange={onOpenChange}
      disablePointerDismissal={true}
      dismissable={false}
    >
      <CredenzaContent className="sm:max-w-md max-w-lg w-full border-0 shadow-2xl p-0">
        <ScrollArea className="min-h-[500px] h-[500px] p-2 sm:p-4">
          <CredenzaHeader className="space-y-1">
            <CredenzaTitle className="text-2xl font-semibold">
              Complete payment
            </CredenzaTitle>
            <CredenzaDescription className="text-sm text-muted-foreground">
              Select the blockchain network and token you want to use to
              complete this payment.
            </CredenzaDescription>
          </CredenzaHeader>

          <NavHeader step={stepper.state.current.data.id} />

          {stepper.flow.switch({
            "step-1": () => (
              <ConfigSelect
                amount={amount}
                convertedAmount={convertedAmount}
                currency={currency}
                selectedNetwork={selectedNetwork}
                onNetworkSelect={handleNetworkSelect}
                selectedAsset={selectedStablecoin}
                onAssetSelected={handleAssetSelect}
                paymentInit={paymentInit}
                reference={reference}
                callbackUrl={callbackUrl}
                metadata={metadata}
              />
            ),
            "step-2": () => (
              <Deposit
                amount={amount}
                convertedAmount={convertedAmount}
                currency={currency}
                networkName={selectedNetwork}
                stablecoinSymbol={selectedStablecoin}
                onCopyAddress={handleCopyAddress}
                copied={copied}
                paymentAddress={paymentAddress}
                paymentInit={paymentInit}
                paymentConfirm={paymentConfirm}
                onPaymentMade={handlePaymentMade}
                onTimerEnd={handleTimerEnd}
              />
            ),
          })}
        </ScrollArea>
      </CredenzaContent>
    </Credenza>
  );
}

// ─── NavHeader ────────────────────────────────────────────────────────────────
// Memoised: only depends on stepper state, never on payment state.

const NavHeader = memo(function NavHeader({ step }: any) {
  const isStep1 = step === "step-1";
  const isStep2 = step === "step-2";

  return (
    <div className="flex w-full items-center">
      <div className="grid place-items-center">
        <Wallet className={cn("w-5 h-5", { "text-primary": isStep1 })} />
        <span className={cn({ "text-primary": isStep1 })}>Choose asset</span>
      </div>
      <div className="h-0.5 rounded-2xl w-[150px] mx-auto dark:bg-white bg-primary" />
      <div className="grid place-items-center">
        <Send className={cn("w-5 h-5", { "text-primary": isStep2 })} />
        <span className={cn({ "text-primary": isStep2 })}>Send deposit</span>
      </div>
    </div>
  );
});

// ─── Formatting Utilities ─────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

// ─── Deposit ──────────────────────────────────────────────────────────────────
// Memoised: only re-renders when its own props change, not on every parent
// dispatch that touches unrelated slices (e.g. selectedNetwork on step-1).

const Deposit = memo(function Deposit({
  amount,
  convertedAmount,
  currency,
  copied,
  stablecoinSymbol,
  paymentAddress,
  paymentInit,
  paymentConfirm,
  onPaymentMade,
  networkName,
  onCopyAddress,
  onTimerEnd,
}: any) {
  const [count, { startCountdown }] = useCountdown({
    countStart: 300,
    intervalMs: 1000,
  });

  // Start the countdown exactly once when the Deposit mounts.
  // Previously the countdown was started inside an effect with no deps guard,
  // and `onTimerEnd` was an inline arrow function – both caused subtle
  // restarts on re-renders.
  useEffect(() => {
    startCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty – run once on mount

  // NOTE: If useCountdown does not accept an `onEnd` callback, keep the
  // original count-watching pattern but pass a stable `onTimerEnd` (which
  // the parent now provides via useCallback).
  useEffect(() => {
    if (count <= 0) onTimerEnd();
  }, [count]);

  const resolvedAddress = paymentInit?.data?.address ?? paymentAddress;

  return (
    <div className="space-y-6 py-4">
      <Item>
        <ItemContent>
          <ItemTitle>Awaiting payment</ItemTitle>
          <ItemDescription>Send exact amount to avoid delays</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge>
            <Clock className="size-4" />
            {/* Render count from useCountdown here */}
            {formatTime(count)}
          </Badge>
        </ItemActions>
      </Item>

      <Card>
        <CardContent className="grid items-center place-items-center gap-2 justify-center">
          <div className="flex space-x-0.5 items-center justify-center w-full">
            <span className="text-sm font-normal">Pay exactly</span>
            <h1 className="text-3xl font-semibold">
              {convertedAmount.toFixed(2)} {stablecoinSymbol.toUpperCase()}
            </h1>
            {/*<Button variant="outline" size="icon-sm">
              <Copy className="size-4" />
            </Button>*/}
          </div>
          <span className="text-xs font-normal text-center text-muted-foreground">
            ~{amount} {currency}
          </span>
          <Badge>
            Network: {stablecoinSymbol.toUpperCase()}-
            {networkName.toUpperCase()}
          </Badge>
        </CardContent>
      </Card>

      <Alert variant="default">
        <InfoIcon />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Send only the exact amount shown on the correct network to ensure
          automatic detection of funds and avoid loss.
        </AlertDescription>
      </Alert>
      <div className="space-y-3 pt-2 flex flex-col place-items-center">
        <div className="flex flex-col w-64 border border-border p-3 rounded-sm">
          <QRCode
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox="0 0 256 256"
            value={resolvedAddress}
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Item variant="muted" className="bg-muted">
          <ItemContent>
            <ItemTitle className="text-primary">Payment address</ItemTitle>
            <HoverCard>
              <HoverCardTrigger
                delay={10}
                asChild
                render={() => (
                  <ItemDescription className="text-primary">
                    {resolvedAddress.slice(0, 8)}
                    {"..."}
                    {resolvedAddress.slice(-8)}
                  </ItemDescription>
                )}
              >
                <ItemDescription className="text-primary">
                  {resolvedAddress.slice(0, 8)}
                  {"..."}
                  {resolvedAddress.slice(-8)}
                </ItemDescription>
              </HoverCardTrigger>
              <HoverCardContent className="flex w-64 flex-col gap-0.5">
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox="0 0 256 256"
                  value={resolvedAddress}
                />
              </HoverCardContent>
            </HoverCard>
          </ItemContent>
          <ItemActions>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopyAddress}
              className="ml-2 flex-shrink-0 p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Copy address"
            >
              {copied ? (
                <Check className="w-5 h-5 text-primary" />
              ) : (
                <Copy className="w-5 h-5 text-primary hover:text-foreground transition-colors" />
              )}
            </Button>
          </ItemActions>
        </Item>
      </div>

      <Button
        // FIX: was `(_prev) => !_prev` which is a toggle – incorrect, since
        // clicking twice would disable the query. It should always set to true.
        onClick={onPaymentMade}
        disabled={paymentConfirm.isLoading || paymentConfirm.isFetching}
        className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-lg transition-all active:scale-95"
      >
        <div className="flex items-center gap-2">
          {paymentConfirm.isLoading || paymentConfirm.isFetching ? (
            <Spinner className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          <span>
            {paymentConfirm.isLoading || paymentConfirm.isFetching
              ? "Confirming Payment..."
              : "I have made payment"}
          </span>
        </div>
      </Button>
    </div>
  );
});

// ─── ConfigSelect ─────────────────────────────────────────────────────────────
// Memoised: only depends on asset/network selection, not on deposit state.

const ConfigSelect = memo(function ConfigSelect({
  selectedNetwork,
  onNetworkSelect,
  selectedAsset,
  onAssetSelected,
  amount,
  convertedAmount,
  currency,
  paymentInit,
  reference,
  callbackUrl,
  metadata,
}: any) {
  const handleProceed = useCallback(() => {
    paymentInit.mutate({
      reference,
      amount,
      callbackUrl,
      network: selectedNetwork,
      asset: selectedAsset,
      ...(metadata && {
        merchantMetadata: {
          ...metadata,
        },
      }),
    });
  }, [
    paymentInit,
    reference,
    amount,
    callbackUrl,
    selectedNetwork,
    selectedAsset,
  ]);

  return (
    <div className="grid grid-cols-1 gap-4 w-full">
      <Card>
        <CardContent>
          <span className="text-sm font-normal">Amount to pay</span>
          <h1 className="text-3xl font-semibold">
            {convertedAmount.toFixed(2)} {selectedAsset.toUpperCase()}
          </h1>
          <span className="text-xs font-normal text-muted-foreground">
            ~{amount} {currency}
          </span>
        </CardContent>
      </Card>

      <div className="flex-col space-y-2.5 w-full">
        <Label className="text-sm font-medium text-foreground">
          Select stablecoin
        </Label>
        <Select value={selectedAsset} onValueChange={onAssetSelected}>
          <SelectTrigger className="h-[2.8rem] w-full border border-border bg-background hover:border-accent transition-colors">
            <SelectValue className="text-primary flex items-center h-full">
              {(value) => {
                console.log("Peek into value and field of select", value);
                return (
                  <div className="flex items-center gap-2 h-full">
                    <img
                      src={
                        selectedAsset.toUpperCase() === "USDC"
                          ? "https://afsnk.afullsnack.dev/images/usdc.png"
                          : "https://afsnk.afullsnack.dev/images/usdt.svg"
                      }
                      className="size-4 rounded-full bg-accent"
                    />
                    <span>{selectedAsset.toUpperCase()}</span>
                  </div>
                );
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STABLECOINS.map((coin) => (
              <SelectItem key={coin.id} value={coin.id}>
                <div className="flex items-center gap-2">
                  <img
                    src={
                      coin.symbol === "USDC"
                        ? "https://afsnk.afullsnack.dev/images/usdc.png"
                        : "https://afsnk.afullsnack.dev/images/usdt.svg"
                    }
                    className="size-6 rounded-full bg-accent"
                  />
                  <span className="text-primary">{coin.name}</span>
                  <span className="text-primary">({coin.symbol})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-col gap-1 w-full h-24">
        <Label className="text-sm font-medium text-foreground">
          Select network
        </Label>
        <Select value={selectedNetwork} onValueChange={onNetworkSelect}>
          <SelectTrigger className="h-20 w-full border border-border bg-background hover:border-accent transition-colors">
            <SelectValue className="text-primary flex items-center">
              {(value) => {
                return (
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        value === "base"
                          ? "https://afsnk.afullsnack.dev/images/base.jpeg"
                          : "https://afsnk.afullsnack.dev/images/binance.jpeg"
                      }
                      className="size-4 rounded-full bg-accent"
                    />
                    <span className="text-primary">
                      {value === "base" ? "Base" : "Binance Smart Chain"}
                    </span>
                  </div>
                );
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {NETWORKS.map((network) => (
              <SelectItem key={network.id} value={network.id}>
                <div className="flex items-center gap-2">
                  <img
                    src={
                      network.symbol === "BASE"
                        ? "https://afsnk.afullsnack.dev/images/base.jpeg"
                        : "https://afsnk.afullsnack.dev/images/binance.jpeg"
                    }
                    className="size-4 rounded-full bg-accent"
                  />
                  <span className="text-primary">{network.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        disabled={paymentInit.isPending}
        className="ml-2 flex-shrink-0 p-2 rounded-md hover:bg-muted transition-colors"
        onClick={handleProceed}
      >
        {paymentInit.isPending ? (
          <div className="flex items-center gap-2">
            <Spinner className="w-4 h-4" />
            <span>Getting address…</span>
          </div>
        ) : (
          "Get payment address"
        )}
      </Button>
    </div>
  );
});
