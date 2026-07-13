import { env } from "#/env";
import {

  jwtAuthenticator,
  wsconnect,
} from "@nats-io/nats-core";
import type {NatsConnection} from "@nats-io/nats-core"
import { Kvm } from "@nats-io/kv";
import type {KV} from "@nats-io/kv"
// import { type ObjectStore, Objm } from "@nats-io/obj";

export const NATS_URL = env.VITE_NATS_CON_URL || "wss://demo.nats.io:8443";
export const NATS_KV_KEY = env.VITE_NATS_KV_KEY || `baggit-transaction-kv`

// React 19 `use()` requires a stable promise identity across renders, so
// these caches must NOT be reset mid-flight on rejection. Failures surface
// to the ErrorBoundary; user reloads to retry.

let ncP: Promise<NatsConnection> | null = null;
export function natsConn(): Promise<NatsConnection> {
  return ncP ??= wsconnect({
    servers: [NATS_URL],
    authenticator: import.meta.env.DEV ? undefined : jwtAuthenticator(
      env.VITE_NATS_USER_JWT,
      new TextEncoder().encode(env.VITE_NATS_USER_NKEY),
    )});
}

let kvP: Promise<KV> | null = null;
export function natsKv(): Promise<KV> {
  return kvP ??= natsConn().then((nc) =>
    new Kvm(nc).create("baggit-transaction-kv", {max_bytes: 500_000_000})
  );
}

// let objP: Promise<ObjectStore> | null = null;
// export function natsObj(): Promise<ObjectStore> {
//   return objP ??= natsConn().then((nc) =>
//     new Objm(nc).create("my_react_obj_example")
//   );
// }
