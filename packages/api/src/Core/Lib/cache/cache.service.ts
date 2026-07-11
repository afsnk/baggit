import { NatsConnection, connect, jwtAuthenticator } from "@nats-io/transport-node";
import {KV, Kvm} from "@nats-io/kv"
import { useLogger } from "evlog/elysia";
import env from "@/Core/Config/env";


interface CacheFunctions {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: string, ttl: string) => Promise<void>;
  update: (key: string, value: string) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

interface PlatformCache {
  transaction: CacheFunctions;
  [key: string]: CacheFunctions;
}

class Cache {
  private static instance: Cache;
  private static kvm: Kvm;
  private static transactionKv: KV
  private defaultKv = `baggit-kv`;
  private static transactionKvKey = `baggit-transaction-kv`

  constructor() { }

  static async initKVM(nc: NatsConnection) {
    const log = useLogger()
    try {
      console.log(`Nats server`, nc.getServer())
      this.kvm = new Kvm(nc)
      this.transactionKv = await this.kvm.create(this.transactionKvKey).catch(error => {
        console.log(`error`, { error })
        throw error
      })

      log.set({kvState: `KV initialised successful`})
      return this.getInstance()
    }
    catch (error: any) {
      console.log(`Nats server`, nc.getServer())
      log.error(error)
      log.set({
        kvState: `Failed to initialise kv`, error
      })
      throw new Error(`Failed to initialise kv`, {cause: error?.cause})
    }

  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Cache()
    }
    return this.instance
  }

  get transaction(): CacheFunctions {
    return {
      async get(key) {
        return await Cache.transactionKv?.get(key);
      },
      async set(key: string, value: string, ttl: string) {
        console.log(`Cache TTL: `, ttl)

        try {
          await Cache.transactionKv.put(key, value)
        } catch {
          await Cache.transactionKv.create(key, value);
        }
      },
      async update(key, value) {
        await Cache.transactionKv.put(key, value)
      },
      async delete (key: string) {
        return await Cache.transactionKv.delete(key);
      }
    }
  }
}

const cache = await Cache.initKVM(await connect({
  servers: env.NATS_SERVER_URL || "nats://localhost:4222",
  authenticator: env.NODE_ENV === "production" ? jwtAuthenticator(
      env.NATS_USER_JWT,
      new TextEncoder().encode(env.NATS_USER_NKEY),
    ) : undefined
}).catch(error => {
  console.log(`[nats] Failed to connect to nats`, { error })
  throw error
}));

export default cache;
