export const REGIONS = [
  "US",
  "CA",
  "UK",
  "EU",
  "JP",
  "SG",
  "HK",
  "AU",
  "BR",
  "NG",
  "KE",
  "ZA",
  "IN",
  "MX",
  "CO",
  "AR",
  "PE",
  "CH",
  "AE",
  "TR",
] as const

export type Region = (typeof REGIONS)[number]

export function isRegion(value: string): value is Region {
  return REGIONS.includes(value as Region)
}
