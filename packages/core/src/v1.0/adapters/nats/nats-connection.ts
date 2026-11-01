import { connect, type NatsConnection, type JetStreamClient } from "nats"

export interface NatsConfig {
  servers: string | string[]
  name?: string
  token?: string
  maxReconnectAttempts?: number
  reconnectTimeWait?: number
}

export class NatsConnectionManager {
  private nc: NatsConnection | null = null
  private js: JetStreamClient | null = null

  async connect(config: NatsConfig): Promise<void> {
    this.nc = await connect({
      servers: config.servers,
      name: config.name ?? "apra-core",
      token: config.token,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      reconnectTimeWait: config.reconnectTimeWait ?? 1000,
    })
    this.js = this.nc.jetstream()
  }

  getConnection(): NatsConnection {
    if (!this.nc) throw new Error("NATS not connected")
    return this.nc
  }

  getJetStream(): JetStreamClient {
    if (!this.js) throw new Error("NATS JetStream not available")
    return this.js
  }

  async disconnect(): Promise<void> {
    if (this.nc) {
      await this.nc.drain()
      this.nc = null
      this.js = null
    }
  }

  isConnected(): boolean {
    return this.nc ? !this.nc.isClosed() : false
  }
}
