import { connect } from "@nats-io/transport-node";
import { Queue, Worker } from "./index";

interface EmailJob {
  to: string;
  subject: string;
}

async function main() {
  const nc = await connect({ servers: "localhost:4222" });

  // 1. Open a queue. Creates a WorkQueue stream capturing `emails.>`.
  const queue = await Queue.open(nc, {
    name: "emails",
    ackWaitMs: 30_000,
    maxDeliver: 5,
  });

  // 2. Start a worker. Run this same code in N processes to scale out.
  const worker = await Worker.start<EmailJob>(
    queue,
    async (job) => {
      console.log(`attempt ${job.attempt} for seq ${job.seq}`, job.data);

      await sendEmail(job.data); // your work here

      // Return cleanly to ack (message is deleted from the stream), or:
      //   job.retry(5_000) -> redeliver after 5s
      //   job.fail()       -> permanent failure, no redelivery
    },
    {
      consumer: "email-workers",
      filterType: "send",
      onError: (err, job) => console.error(`job ${job.seq} failed:`, err),
    },
  );

  // 3. Enqueue work. `send` becomes the subject `emails.send`.

  await Promise.all([
    1,2,3
    ].map((v) => queue.enqueue<EmailJob>(
      "send",
      { to: `${v}@b.com`, subject: "Testing enqueuing and handlers" },
      { dedupeId: `${v}-a@b.com` }, // optional: rejects duplicates server-side
    )))

  process.on("SIGINT", async () => {
    await worker.stop();
    await nc.drain();
    console.log(`worker stopped, connection drained: shutting down...`)
    process.exit(0);
  });
}

async function sendEmail(job: EmailJob): Promise<void> {
  console.log(`Processing email job:`, {job})
  await new Promise((r) => setTimeout(r, 100));
}

main().catch(console.error);
