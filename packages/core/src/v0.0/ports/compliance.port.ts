/**
 * REQUIREMENTS.md §2.7: compliance abstraction.
 * Sanctions screening is a hard gate before any broadcast or payout.
 */
export type ScreeningSubjectType = "customer" | "counterparty"
export type ScreeningVerdict = "clear" | "flagged" | "rejected"

export interface ScreeningInput {
  subjectType: ScreeningSubjectType
  subjectId: string
  displayName?: string
  addresses?: string[]
  /** Corridor context for vendor rules. */
  fiatCurrency?: string
  chain?: string
}

export interface ScreeningOutcome {
  resultId: string
  vendor: string
  verdict: ScreeningVerdict
  screenedAt: string
  reasons?: string[]
}

export type KycLevel = "none" | "basic" | "intermediate" | "advanced"

export interface CompliancePort {
  screen(input: ScreeningInput): Promise<ScreeningOutcome>
  getKycLevel(customerId: string): Promise<KycLevel>
}
