import { useState, useCallback } from "react";

interface UsePaymentOptions {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

export function usePayment(options?: UsePaymentOptions) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("USD");

  const openPayment = useCallback(
    (chargeAmount: number, chargeCurrency = "USD") => {
      setAmount(chargeAmount);
      setCurrency(chargeCurrency);
      setOpen(true);
    },
    [],
  );

  const closePayment = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    open,
    setOpen,
    amount,
    currency,
    openPayment,
    closePayment,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  };
}
