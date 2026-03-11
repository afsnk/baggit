import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, CheckCircle, Copy, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { betterFetch } from "@better-fetch/fetch";

interface StablecoinPaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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

  const queryClient = useQueryClient();

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
        // const response = await fetch(`${apiUrl}/payment/init`, {
        //   method: "POST",
        //   body: values,
        // });
        // if (response.ok) {
        //   const json = await response.json();
        //   return json;
        // } else {
        //   console.log(`Response`, { response });
        //   throw new Error("Request failed to confirm payment");
        // }
      } catch (error: any) {
        console.log("Failed to make request", { error });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Data injustice...", { data });
      setPaymentAddress(data?.address);
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
  // Generate address when network or stablecoin changes
  useEffect(() => {
    setCopied(false);
    setPaymentMade(false);
    paymentInit.reset();
  }, [selectedNetwork, selectedStablecoin]);

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full border-0 shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-semibold">
            Pay with Stablecoin
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Send {amount} {currency} in {stablecoinSymbol}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-around space-x-2">
            {/* Network Selection */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-foreground">
                Network
              </label>
              <Select
                value={selectedNetwork}
                onValueChange={setSelectedNetwork}
              >
                <SelectTrigger className="h-11 border border-border bg-background hover:border-accent transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NETWORKS.map((network) => (
                    <SelectItem key={network.id} value={network.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span>{network.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stablecoin Selection */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-foreground">
                Stablecoin
              </label>
              <Select
                value={selectedStablecoin}
                onValueChange={setSelectedStablecoin}
              >
                <SelectTrigger className="h-11 border border-border bg-background hover:border-accent transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STABLECOINS.map((coin) => (
                    <SelectItem key={coin.id} value={coin.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span>{coin.name}</span>
                        <span className="text-muted-foreground text-sm">
                          ({coin.symbol})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {paymentInit.data && (
            <>
              {/* Payment Address Section */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium text-foreground">
                  Payment Address
                </label>
                <div className="relative">
                  <div className="flex items-center justify-between bg-muted/50 border border-border rounded-lg px-4 py-3 group hover:border-accent/50 transition-colors">
                    <code className="font-mono text-sm tracking-wider text-foreground break-all">
                      {paymentInit?.data?.address ?? paymentAddress}
                    </code>
                    <button
                      onClick={handleCopyAddress}
                      className="ml-2 flex-shrink-0 p-2 rounded-md hover:bg-muted transition-colors"
                      aria-label="Copy address"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-accent" />
                      ) : (
                        <Copy className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-xs text-accent mt-2 animate-in fade-in">
                      Address copied to clipboard
                    </p>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-accent/10 border border-accent/20 rounded-lg px-4 py-3 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Send exactly {amount} {stablecoinSymbol}
                </p>
                <p className="text-xs text-muted-foreground">
                  Transaction will be processed on {networkName}. Do not send
                  from exchange or other smart contracts.
                </p>
              </div>
            </>
          )}
        </div>

        {!paymentInit.data && (
          <>
            <Button
              disabled={paymentInit.isPending}
              className="ml-2 flex-shrink-0 p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => {
                paymentInit.mutate({
                  reference: reference,
                  amount: amount,
                  callbackUrl: callbackUrl,
                  network: selectedNetwork,
                  asset: selectedStablecoin,
                } as any);
              }}
            >
              Get payment address
            </Button>
          </>
        )}
        {paymentInit.data && (
          <>
            {/* Connect Wallet Button */}
            <Button
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
            </Button>
            <Button
              onClick={() => setPaymentMade((_prev) => !_prev)}
              disabled={isConnecting}
              className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-lg transition-all active:scale-95"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>I have made payment</span>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
