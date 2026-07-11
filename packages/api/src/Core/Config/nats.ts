import { connect, credsAuthenticator, deferred, jwtAuthenticator, nuid, tokenAuthenticator } from "@nats-io/transport-node"
import env from "./env";

type TPayload = {
  ts: string;
  i: number
}

async function main() {
  const nc = await connect({ servers: env.NATS_SERVER_URL || "nats://localhost:4222",
  authenticator: env.NODE_ENV === "production" ? jwtAuthenticator(
      env.NATS_USER_JWT,
      new TextEncoder().encode(env.NATS_USER_NKEY),
    ) : undefined })

  console.log(`connected`, nc.getServer());

  const subj = `user.otel.info`;

  const sub = nc.subscribe(subj);

  (async () => {
    for await (const m of sub) {
      console.log(`Processed: ${sub.getProcessed()}`)
      console.log(m.subject, m.json<TPayload>());
    }
  })()

  // Subscribe with wildcard support
  nc.subscribe(`user.otel.*`, {
    max: 2, // could be cool use-case for this
    callback: (err, msg) => {
      if (err) throw err
      console.log(`Processing stream: ${msg.subject}; Headers: ${msg.headers?.keys()}`, msg.json<TPayload>())
    }
  })

  let i = 0;
  const d = deferred();
  const timer = setInterval(() => {
    i++;
    nc.publish(subj, JSON.stringify({ ts: new Date().toISOString(), i }));
    if (i === 10) {
      clearInterval(timer);
      d.resolve();
    }
  }, 1000);

  await d;
  await nc.drain();

}


main().catch(console.log)
