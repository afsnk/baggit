# REQUIREMENTS.md

## Project Title
Adaptive Provider Routing Architecture (APRA) — Serverless Crypto On/Off Ramp Aggregator

## 1. Objective
Build a reusable TypeScript package and deployable serverless application for aggregating multiple crypto on/off-ramp providers into a unified routing engine that ranks routes by availability, fees, historical settlement speed, and reliability.

The system must be:
- Provider-extensible (new integrations weekly)
- Serverless-native
- Event-driven
- Package-first (all modules importable by third parties)
- Strongly typed
- Testable
- Horizontally scalable
- Runtime agnostic where possible (optimized for Bun)

---

## 2. Core Functional Requirements

### 2.1 Provider Integration Layer
Each provider must implement a common adapter contract.

Required capabilities:
- availability checks
- quote generation
- transaction initiation
- settlement polling/webhook handling
- capability declaration
- provider health reporting

Providers must be hot-pluggable via registry registration only.
No core engine modification allowed when adding a provider.

---

### 2.2 Route Discovery
The engine must:
- discover compatible providers
- filter by:
  - geography
  - fiat currency
  - crypto asset
  - payment method
  - compliance/KYC requirements
- fetch quotes concurrently
- enrich quotes with historical metrics
- compute weighted scores
- return ranked routes

Ranking factors:
- settlement speed
- fee percentage
- liquidity depth
- failure rate
- provider uptime
- regional availability

---

### 2.3 Analytics
Capture events:
- TransactionInitiated
- QuoteRequested
- SettlementStarted
- SettlementCompleted
- SettlementFailed
- LiquidityUnavailable
- WebhookReceived
- KYCRejected

Derived metrics:
- avg settlement
- p95 settlement
- success rate
- timeout rate
- provider uptime
- route conversion rate

---

### 2.4 Caching
Use NATS-backed cache abstraction for:
- provider availability snapshots
- quote caching
- scoring cache
- metrics cache
- provider capability cache

TTL configurable per cache namespace.

---

## 3. Non-Functional Requirements

### Serverless
Must work on:
- Fly Machines
- Cloudflare Workers
- Vercel Functions
- AWS Lambda

Avoid:
- sticky sessions
- long-lived memory state
- in-process queues
- local cron assumptions

Design for stateless execution.

### Performance
Route discovery p95 < 500ms cached
Route discovery p95 < 2s uncached

### Reliability
Graceful provider degradation.
Circuit breaker per provider.

### Observability
OpenTelemetry hooks.
Structured logs.
Trace IDs.

---

## 4. Technology Stack

Language:
- TypeScript strict mode

Runtime:
- Bun-first
- standards-compatible fetch APIs

Database:
- Development → SQLite
- Production → libSQL / Turso

Messaging + Cache:
- NATS

Validation:
- Zod

Testing:
- Vitest

Packaging:
- tsup
- ESM-first
- CJS compatibility

---

## 5. Architecture

Pattern:
Hexagonal Architecture + Strategy + Registry + Event Bus

Layers:
1. domain
2. application
3. ports
4. adapters
5. infrastructure
6. packages/sdk

Dependencies must point inward only.

---

## 6. Folder Structure

```text
packages/
  core/
    src/
      domain/
        entities/
        value-objects/
        events/
        contracts/

      application/
        routing/
        scoring/
        settlement/
        analytics/

      ports/
        ProviderPort.ts
        EventBusPort.ts
        CachePort.ts
        DBPort.ts

      registry/
        ProviderRegistry.ts

      primitives/
        emit.ts
        subscribe.ts
        cache.ts
        lock.ts
        idempotency.ts

      utils/

  providers/
    moonpay/
    transak/
    ramp/
    yellowcard/

  adapters/
    nats/
    sqlite/
    libsql/
    telemetry/

  sdk/
    src/
      client/
      hooks/
      types/

apps/
  api/
  workers/
  webhook/

configs/

tests/
```

---

## 7. Reusable Primitive APIs

### emit
```ts
await emit("SettlementCompleted", payload)
```

Requirements:
- wraps NATS publish
- automatic serialization
- trace propagation
- retries
- dead-letter subject

### subscribe
```ts
subscribe("SettlementCompleted", handler)
```

Requirements:
- typed payloads
- ack abstraction
- retries
- idempotency support

### cache
```ts
await cache.get(key)
await cache.set(key, value, ttl)
```

Must abstract NATS KV/object store.

### lock
Distributed lock primitive using NATS.

---

## 8. Database Design

SQLite/libSQL schema:
- providers
- quotes
- transactions
- settlements
- provider_metrics
- route_metrics
- event_log

Must use:
- migrations
- repository pattern
- read/write separation abstraction

No raw SQL leakage outside adapter layer.

---

## 9. Packaging Requirements

Every module exportable:

Example:
```ts
import { RouteEngine } from "@apra/core"
import { emit } from "@apra/core/primitives"
import { MoonpayProvider } from "@apra/providers-moonpay"
```

No app-level singleton coupling.
Constructor injection everywhere.

Peer-friendly APIs.

---

## 10. Implementation Order

Phase 1:
- contracts
- registry
- route engine
- scoring engine

Phase 2:
- NATS primitives
- analytics consumers
- cache layer

Phase 3:
- sqlite/libsql adapter
- repositories

Phase 4:
- provider adapters

Phase 5:
- sdk package
- docs
- examples

---

## 11. Acceptance Criteria

A new provider integration requires:
1 file adapter
1 registry registration
0 core changes

Analytics update automatically via events.

All packages independently importable.

Must run statelessly in serverless environments.

