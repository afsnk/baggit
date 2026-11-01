export const KYC_LEVELS = ["none", "basic", "intermediate", "advanced"] as const

export type KYCLevel = (typeof KYC_LEVELS)[number]

export const KYC_REQUIREMENTS = {
  none: [],
  basic: ["email", "phone"],
  intermediate: ["email", "phone", "id_verification", "selfie"],
  advanced: [
    "email",
    "phone",
    "id_verification",
    "selfie",
    "proof_of_address",
    "source_of_funds",
  ],
} as const satisfies Record<KYCLevel, readonly string[]>

export function meetsKYCRequirement(
  userKYC: KYCLevel,
  requiredKYC: KYCLevel,
): boolean {
  const levels: KYCLevel[] = ["none", "basic", "intermediate", "advanced"]
  return levels.indexOf(userKYC) >= levels.indexOf(requiredKYC)
}
