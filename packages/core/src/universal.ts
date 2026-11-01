/**
 * Universal-tier entry (REQUIREMENTS.md §12): safe in browser, worker, and
 * server. Domain, money types, DTOs/Zod contracts, ports (types), pure
 * primitives. No Node globals, no secrets, no infrastructure adapters.
 */
export * from "./domain/index"
export * from "./ports/index"
export * from "./primitives/index"
export * from "./registry/index"
export * from "./configs/index"
export * from "./utils/index"
