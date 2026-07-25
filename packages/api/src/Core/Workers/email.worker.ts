import { sendEmail, type IEmailProps } from "../Lib/email"
import { Queue, Worker } from "../Lib/queue"
import { connect, jwtAuthenticator } from "@nats-io/transport-node";
import env from "../Config/env";

const nc = await connect({ servers: env.NATS_SERVER_URL || "nats://localhost:4222",
authenticator: env.NODE_ENV === "production" ? jwtAuthenticator(
    env.NATS_USER_JWT,
    new TextEncoder().encode(env.NATS_USER_NKEY),
  ) : undefined });

export const emailQueue = await Queue.open(nc, {
	name: "emails",
	ackWaitMs: 30_000, // Why 30ms,
	maxDeliver: 5
})

const emailWorker = await Worker.start<IEmailProps>(
	emailQueue,
	async (job) => {
		console.log({ attempt: job.attempt, seq: job.seq, data: {...job.data, body: null} })
		await sendEmail({
			...job.data
		})
	},
	{
		consumer: "email-worker",
		filterType: "send",
		onError: (error: any, job) => console.error(error, {
			attempt: job.attempt, seq: job.seq, type: job.type
		})
	}
);


console.log(`Email worker all set...`)
const shutdown = async () => {
  await emailWorker.stop();
  await nc.drain();
  console.log(`Email Worker stopped, connection drained: shutting down...`)
  process.exit(0);
}

process.on("SIGINT", shutdown)
