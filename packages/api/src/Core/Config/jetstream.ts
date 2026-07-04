import {
  jetstreamManager,
  type JetStreamManager
} from "@nats-io/jetstream"
import { NatsConnection } from "@nats-io/transport-node";


// controls worker queue stuff and stream management for persistence
class Jetstream {
  private static jsm: JetStreamManager | null = null;
  static STREAMS = {
    default: `default`
  } as const

  static async initJSM(nc: NatsConnection) {
    if (!this.jsm) {
      this.jsm = await jetstreamManager(nc)
    }
  }

  static async listStreams() {
    if (!this.jsm) return [];
    const list = []
    for await (const si of this.jsm?.streams.list()) {
      list.push(si)
    }
    return list;
  }
}
