# Serverless-Style Multi-Subdomain Authentication Architecture (Bun + Elysia + Better Auth + Caddy + Fly.io)

## Executive Summary

This document updates the original architecture to align with your infrastructure decisions:

- **Runtime:** Bun
- **Web framework:** Elysia
- **Authentication library:** Better Auth
- **Reverse proxy / ingress:** Caddy
- **Hosting:** Fly.io
- **Multi-subdomain routing:** Caddy host-based routing
- **Auth isolation:** `auth.project.io` handled by dedicated auth service/routes
- **Default handlers:** all other hosts route to application handlers (REST, SSE, realtime)

---

# 1) Updated High-Level Architecture

```text
                              Internet
                                  │
                                  │
                          ┌───────▼────────┐
                          │  Fly.io Anycast│
                          │ Global Edge    │
                          └───────┬────────┘
                                  │
                                  │
                         ┌────────▼────────┐
                         │  Caddy Reverse  │
                         │     Proxy       │
                         └─────┬─────┬─────┘
                               │     │
         Host = auth.project.io│     │Host = *.project.io / others
                               │     │
                    ┌──────────▼┐   ┌▼──────────────────────────┐
                    │Auth Routes│   │ Default Route Handlers    │
                    │Elysia App │   │ Elysia App                │
                    │Better Auth│   │ REST / SSE / Realtime     │
                    └──────┬────┘   └──────────┬────────────────┘
                           │                   │
                           └────────┬──────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │ Shared Internal Modules        │
                    │ auth-core / permissions / sdk  │
                    └───────────────┬────────────────┘
                                    │
                  ┌─────────────────┼──────────────────┐
                  │                 │                  │
          ┌───────▼──────┐  ┌──────▼──────┐  ┌────────▼────────┐
          │ Postgres     │  │ Redis / KV  │  │ Event Backbone │
          │ sessions     │  │ cache/rate  │  │ pubsub streams │
          └──────────────┘  └─────────────┘  └─────────────────┘
```

---

# 2) Original Recommendation vs Updated Recommendation

## Original
Centralized auth service with distributed stateless verification.

## Updated
Keep centralized auth **but move routing separation to Caddy**.

### Why this is better
- Clear network boundary
- Auth traffic isolated
- Easier scaling
- Better observability
- Cleaner security policy separation

---

# 3) Caddy Routing Layer

## Suggested Caddyfile

```caddy
{
    email ops@project.io
}

auth.project.io {
    reverse_proxy auth-service.internal:3000
}

*.project.io {
    reverse_proxy app-service.internal:3000
}

project.io {
    reverse_proxy app-service.internal:3000
}
```

## Suggested improvement over original
**Original:** route splitting inside app code

**Change:** split at reverse proxy layer

**Reason:** lower latency dispatch + cleaner isolation

---

# 4) Elysia Service Layout

```text
apps/
   gateway/
   auth/
   core-app/
packages/
   auth-core/
   auth-sdk/
   events/
   permissions/
```

## Auth App
Handles:

- login
- signup
- sessions
- refresh
- MFA
- API key issuance
- API key revocation

## Core App
Handles:

- APIs
- SSE
- webhooks
- realtime events
- business routes

---

# 5) Better Auth Integration

Only mounted in auth app.

```ts
app.use(authPlugin)
```

Never duplicate auth engine in business services.

Business services:

verify only.

---

# 6) Identity Model

## Human
Claims:

```json
{
  "sub": "usr_x",
  "type": "user",
  "org": "org_1",
  "role": "admin"
}
```

## Machine

```json
{
  "sub": "key_x",
  "type": "api_key",
  "scope": ["payments:create"]
}
```

---

# 7) Session Strategy

Cookie:

```text
Domain=.project.io
Secure
HttpOnly
SameSite=Lax
```

SSO across all subdomains.

---

# 8) API Key Strategy

Store only hash.

Format:

```text
pk_live_xxx
sk_live_xxx
wk_live_xxx
```

Recommended addition:

Add embedded prefix metadata:

```text
pk_live_org_abc_xxx
```

Reason:

Fast classification.

---

# 9) Realtime / SSE

Default handler branch should manage:

- notifications
- live balances
- settlement updates
- audit feeds

## Suggested topology

```text
Client
  │
  │ SSE connect
  ▼
Elysia SSE endpoint
  │
  ▼
Redis pub/sub
  │
  ▼
Worker fanout
```

---

# 10) Fly.io Deployment

Recommended:

Separate Machines:

- caddy
- auth-service
- app-service
- worker-service

## Original
single service deployment

## Suggested change
multi-machine logical separation

Reason:

blast radius reduction

---

# 11) Security Suggestions

## Internal service signature
Forward:

- x-auth-sub
- x-auth-org
- x-auth-role
- x-auth-type
- x-internal-signature

## Key signing
Prefer:

Ed25519

Reason:

fast + Bun compatible

---

# 12) Final Recommended Architecture

Your strongest production topology:

```text
Fly Edge
   ↓
Caddy
   ├── auth.project.io → Auth Elysia + Better Auth
   └── *.project.io → Core Elysia routes
                         ├ REST
                         ├ SSE
                         ├ Webhooks
                         ├ Realtime
                         └ Internal APIs
```

This is clean, horizontally scalable, and operationally simple.
