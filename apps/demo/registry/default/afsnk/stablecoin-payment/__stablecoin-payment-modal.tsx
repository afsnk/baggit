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
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

const { useStepper } = defineStepper(
  { id: "step-1", title: "Choose Asset" },
  { id: "step-2", title: "Send Deposit" },
);

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
  onConnect?: () => void | Promise<void>;
}

const NETWORKS = [
  { id: "base", name: "Base", symbol: "BASE" },
  { id: "bsc", name: "Binance Smart Chain", symbol: "BSC" },
];

const STABLECOINS = [
  { id: "usdc", name: "USDC", symbol: "USDC" },
  { id: "usdt", name: "Tether", symbol: "USDT" },
];

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
  onConnect,
}: StablecoinPaymentModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("base");
  const [selectedStablecoin, setSelectedStablecoin] = useState<string>("usdc");
  const [paymentAddress, setPaymentAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [paymentMade, setPaymentMade] = useState(false);
  const stepper = useStepper();

  useEffect(() => {
    console.log("Reference", { reference });
  }, [reference]);
  useEffect(() => {
    if (paymentMade) {
      setTimeout(() => setPaymentMade(false), 2000);
    }
  }, [paymentMade]);

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
    mutationFn: async (values: any) => {
      try {
        console.log("Values", { values });
        const { data, error } = await betterFetch<{
          address: string;
          status: string;
          amount: number;
        }>(`${apiUrl}/payment/init`, {
          body: values,
        });

        if (error) {
          console.log("Error", { error });
          throw error;
        }
        return data;
      } catch (error: any) {
        console.log("Failed to make request", { error });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Data injustice...", { data });
      setPaymentAddress(data?.address);
      stepper.navigation.goTo("step-2");
    },
    onError: (error) => {
      console.log("Ressponse...", { error });
    },
  });
  const paymentConfirm = useQuery({
    queryKey: ["payment", "coinfirm", reference],
    queryFn: async () => {
      try {
        console.log(`⏳ Confirming payment request`);
        const { data, error } = await betterFetch<any>(
          `${apiUrl}/payment/confirm/${reference}`,
        );
        if (error) {
          console.log("Error confirming transaction", { error });
          throw error;
        }
        console.log("data", { data });
        return data;
      } catch (error: any) {
        console.log("Failed to make request", { error });
        throw error;
      }
    },
    enabled: paymentMade,
  });

  useEffect(() => {
    if (paymentConfirm.data) {
      onPaymentFinished(paymentConfirm.data);
      stepper.navigation.goTo("step-1");
      paymentInit.reset();
    } else if (paymentConfirm.error) {
      console.log("Call payment confirm failed with error object");
      onPaymentFailed(paymentConfirm.error);
      stepper.navigation.goTo("step-1");
      paymentInit.reset();
    }
  }, [paymentConfirm.data, paymentConfirm.error, paymentConfirm]);
  // Generate address when network or stablecoin changes
  useEffect(() => {
    setCopied(false);
    setPaymentMade(false);
    paymentInit.reset();
  }, [selectedNetwork, selectedStablecoin]);
  const convertedAmount = amount ? amount / 1365 : 0;

  const handleCopyAddress = () => {
    if (paymentInit.data) {
      navigator.clipboard.writeText(paymentInit.data.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    // Simulate wallet connection - in production, integrate with Web3.js or ethers.js
    setTimeout(() => {
      setIsConnecting(false);
      // Handle wallet connection logic here
      console.log("Wallet connection initiated");
    }, 1500);
  };

  const networkName =
    NETWORKS.find((n) => n.id === selectedNetwork)?.name || "Base";
  const stablecoinSymbol =
    STABLECOINS.find((s) => s.id === selectedStablecoin)?.symbol || "USDC";

  return (
    <Credenza
      open={isOpen}
      onOpenChange={onOpenChange}
      disablePointerDismissal={true}
    >
      <CredenzaContent className="sm:max-w-md max-w-lg w-full border-0 shadow-2xl p-0">
        <ScrollArea className="h-[400px] p-2 sm:p-4">
          <CredenzaHeader className="space-y-1">
            <CredenzaTitle className="text-2xl font-semibold">
              Complete payment
            </CredenzaTitle>
            <CredenzaDescription className="text-sm text-muted-foreground">
              Select the blockchain network and token you want to use to
              complete this payment.
            </CredenzaDescription>
          </CredenzaHeader>
          <NavHeader />

          {stepper.flow.switch({
            "step-1": () => (
              <ConfigSelect
                amount={amount}
                convertedAmount={convertedAmount}
                currency={currency}
                selectedNetwork={selectedNetwork}
                onNetworkSelect={setSelectedNetwork}
                selectedAsset={selectedStablecoin}
                onAssetSelected={setSelectedStablecoin}
                paymentInit={paymentInit}
                reference={reference}
                callbackUrl={callbackUrl}
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
                onPaymentMade={setPaymentMade}
                onTimerEnd={() => {
                  paymentInit?.reset();
                  stepper.navigation.goTo("step-1");
                }}
              />
            ),
          })}
        </ScrollArea>
      </CredenzaContent>
    </Credenza>
  );
}

function NavHeader() {
  const stepper = useStepper();
  const isStep1 = stepper.flow.is("step-1");
  const isStep2 = stepper.flow.is("step-2");
  return (
    <div className="flex w-full items-center">
      <div className="grid place-items-center">
        <Wallet
          className={cn("w-5 h-5", {
            "text-primary": isStep1,
          })}
        />
        <span className={cn({ "text-primary": isStep1 })}>Choose asset</span>
      </div>
      <div className="h-0.5 rounded-2xl w-[150px] mx-auto dark:bg-white bg-primary" />
      <div className="grid place-items-center">
        <Send
          className={cn("w-5 h-5", {
            "text-primary": isStep2,
          })}
        />
        <span className={cn({ "text-primary": isStep2 })}>Send deposit</span>
      </div>
    </div>
  );
}

// ─── Formatting Utilities ────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

const parseToSeconds = (h: number, m: number, s: number) =>
  Number(h) * 3600 + Number(m) * 60 + Number(s);

function Deposit({
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
  const stepper = useStepper();
  const [intervalValue, setIntervalValue] = useState<number>(1000);
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart: 300,
      intervalMs: intervalValue,
    });

  useEffect(() => {
    console.log("Starting countdown");
    startCountdown();
  }, []);
  useEffect(() => {
    if (count <= 0) {
      window.alert("Timer ran out! Please try again.");
      onTimerEnd();
    }
  }, [count]);

  return (
    <div className="space-y-6 py-4">
      <Item>
        <ItemContent>
          <ItemTitle className="text-primary">Awaiting payment</ItemTitle>
          <ItemDescription>Send exact amount to avoid delays</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge>
            <Clock className="size-4" />
            <span>{formatTime(count)}</span>
          </Badge>
        </ItemActions>
      </Item>
      {
        <>
          <Card>
            <CardContent className="grid items-center place-items-center gap-2 justify-center">
              <div className="flex space-x-0.5 items-center justify-center w-full">
                <span className="text-sm font-normal">Pay exactly</span>
                <h1 className="text-3xl font-semibold">
                  {convertedAmount.toFixed(2)} {stablecoinSymbol.toUpperCase()}
                </h1>
                <Button variant="outline" size="icon-sm">
                  <Copy className="size-4" />
                </Button>
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
          {/* Payment Address Section */}
          <div className="space-y-3 pt-2">
            <Item variant="muted" className="bg-muted">
              <ItemContent>
                <ItemTitle className="text-primary">Payment address</ItemTitle>
                <HoverCard>
                  <HoverCardTrigger
                    delay={10}
                    closeDelay={100}
                    render={
                      <ItemDescription className="text-primary">
                        {paymentInit?.data?.addresss ?? paymentAddress}
                      </ItemDescription>
                    }
                  />
                  <HoverCardContent className="flex w-64 flex-col gap-0.5">
                    <QRCode
                      size={256}
                      style={{
                        height: "auto",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                      viewBox={`0 0 256 256`}
                      value={paymentInit?.data?.address ?? paymentAddress}
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
                    <Check className="w-5 h-5 text-accent" />
                  ) : (
                    <Copy className="w-5 h-5 text-accent hover:text-foreground transition-colors" />
                  )}
                </Button>
              </ItemActions>
            </Item>
          </div>
        </>
      }
      {
        <>
          {/* Connect Wallet Button */}
          {/*<Button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-lg transition-all active:scale-95"
          >
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-accent-foreground border-t-transparent animate-spin" />
                <span>Connecting Wallet...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </div>
            )}
          </Button>*/}
          <Button
            onClick={() => onPaymentMade((_prev: boolean) => !_prev)}
            disabled={paymentConfirm.isLoading}
            className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-lg transition-all active:scale-95"
          >
            <div className="flex items-center gap-2">
              {paymentConfirm.isLoading ? (
                <Spinner className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span>
                {paymentConfirm.isLoading
                  ? "Confirming Payment..."
                  : "I have made payment"}
              </span>
            </div>
          </Button>

          {/* Alternative Payment Text */}
          <p className="text-xs text-center text-muted-foreground pt-2">
            Don't have a wallet?{" "}
            <button className="text-accent hover:underline font-medium">
              Learn more
            </button>
          </p>
        </>
      }
    </div>
  );
}

function ConfigSelect({
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
}: any) {
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
      {/* Stablecoin Selection */}
      <div className="flex-col space-y-2.5 w-full h-24">
        <Label className="text-sm font-medium text-foreground">
          Select stablecoin
        </Label>
        <Select value={selectedAsset} onValueChange={onAssetSelected}>
          <SelectTrigger className="h-24 w-full border border-border bg-background hover:border-accent transition-colors">
            <SelectValue className="text-primary" />
          </SelectTrigger>
          <SelectContent>
            {STABLECOINS.map((coin) => (
              <SelectItem key={coin.id} value={coin.id}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-primary">{coin.name}</span>
                  <span className="text-primary">({coin.symbol})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Network Selection */}
      <div className="flex-col gap-1 w-full h-24">
        <Label className="text-sm font-medium text-foreground">
          Select network
        </Label>
        <Select value={selectedNetwork} onValueChange={onNetworkSelect}>
          <SelectTrigger className="h-20 w-full border border-border bg-background hover:border-accent transition-colors">
            <SelectValue className="text-primary" />
          </SelectTrigger>
          <SelectContent>
            {NETWORKS.map((network) => (
              <SelectItem key={network.id} value={network.id}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
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
        onClick={() => {
          paymentInit.mutate({
            reference: reference,
            amount: amount,
            callbackUrl: callbackUrl,
            network: selectedNetwork,
            asset: selectedAsset,
          } as any);
        }}
      >
        Get payment address
      </Button>
    </div>
  );
}
