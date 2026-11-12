import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * REQUIREMENTS.md §14: "Library runs statelessly: no setInterval and no
 * module-level singletons in src/ excluding tests."
 * Static source scan — fails if statelessness mandates regress.
 */

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (full.endsWith(".ts") && !full.endsWith(".test.ts")) out.push(full)
  }
  return out
}

const SRC_ROOT = new URL("../..", import.meta.url).pathname

describe("statelessness mandate — static scan", () => {
  const files = walk(SRC_ROOT)

  it("contains no setInterval/setTimeout timers outside tests", () => {
    const offenders = files.filter((f) => {
      const src = readFileSync(f, "utf8")
      return /\bsetInterval\b|\bsetTimeout\b/.test(src)
    })
    expect(offenders, `in-process timers found in:\n${offenders.join("\n")}`).toEqual([])
  })

  it("exports no module-level event-bus singletons", () => {
    const offenders = files.filter((f) => {
      const src = readFileSync(f, "utf8")
      return /\bsetEventBus\b|\bgetEventBus\b/.test(src)
    })
    expect(offenders, `module singletons found in:\n${offenders.join("\n")}`).toEqual([])
  })
})
