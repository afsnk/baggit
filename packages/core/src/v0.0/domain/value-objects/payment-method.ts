export const PAYMENT_METHODS = [
  "credit_card",
  "debit_card",
  "bank_transfer",
  "apple_pay",
  "google_pay",
  "paypal",
  "pix",
  "spei",
  "picpay",
  "mobile_money",
  "mpesa",
  "gcash",
  "payid",
  "sepa",
  "ach",
  "wire",
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHODS.includes(value as PaymentMethod)
}
