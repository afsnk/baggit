import { natsConn, natsKv } from "#/lib/nats";
import { use, useEffect, useState } from "react";
import type { QueuedIterator, Status } from "@nats-io/nats-core";
import type { KvWatchEntry } from "@nats-io/kv";
import { toast } from "sonner";



// key shape - transaction.tracker.*
export function useNatsKVWatcher(keyToWatch: string) {
  const nc = use(natsConn());
  const kv = use(natsKv());
  const [value, setValue] = useState<string | "processing" | "done" | "failed" | "deleted">();
  const [status, setStatus] = useState<string>();

  useEffect(() => {
    let iter: QueuedIterator<KvWatchEntry> | undefined; // iterator returned by the watch function

    (async () => {
      iter = await kv.watch({ key: keyToWatch });
      console.log(`Watching...`, {server: nc.getServer()})
      for await (const entry of iter) {
        if (entry.operation === "DEL" || entry.operation === "PURGE") {
          setValue("deleted");
        } else {
          setValue(entry.string().toLowerCase());
        }
      }
    })().catch((err) => {
      console.error("[KVW]: Transaction watcher failed, reload:", err);
    });
    return () => {
      iter?.stop();
    };
  }, [kv, keyToWatch]);

  useEffect(() => {
    const statusIter = nc.status() as QueuedIterator<Status>;
    (async () => {
      for await (const s of statusIter) {
        if (s.type === "disconnect") {
          toast.error(`Status tracker disconnected!`)
          setStatus(s.type);
        } else if (s.type === "reconnect") {
          toast.success(`Status tracker reconnected!`)
          setStatus(s.type);
        }
        setStatus(s.type)
      }
    })().catch((err) => {
      console.error("status:", err);
    });
    toast.success(`Status tracker connected`)
  }, [nc])

  return {key: keyToWatch, value, status}
}
