import { SelectInvoice } from "@core/adapters/db/schema/invoice";

export function validateAmountPaid(invoice: SelectInvoice, amountSent: number) {
  const isNaira = invoice.payment.currency === "ngn" || invoice.payment.currency === "cngn";
  const invoiceAmount = invoice.amount
  if (isNaira) {
    // const nairaAmount = this.convertToNGN(amountSent, payment.rate!)
    return amountSent >= invoice.amount;
  }

  return amountSent >= invoice.amount;
}

export function convertToUSD(nairaAmount: number, rate: number) {
  // const rate = 1400
  return (nairaAmount/rate)
}

export function convertToNGN(usdAmount: number, rate: number) {
  // const rate = 1400;
  return (usdAmount*rate)
}
