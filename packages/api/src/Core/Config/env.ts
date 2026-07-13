/* eslint-disable node/no-process-env */
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

expand(config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  ),
}));

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
  DATABASE_URL: z.string().url().default('file:dev.db'),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  TRUSTED_ORIGINS: z.string().default('https://dashboard.baggit.link,https://pay.baggit.link,https://widget.baggit.link'),
  PLUNK_API_KEY: z.string(),
  PLUNK_API_URL: z.url().default('https://next-api.useplunk.com'),

  MERCHANT_CLIENT_URL: z.string().default('https://merchant.baggit.localhost'),
  CHECKOUT_CLIENT_URL: z.string(),

  // Better auth
  BETTER_AUTH_URL: z.string().url(),

  // Zerodev
  ZERODEV_RPC: z.string().url().optional().default('https://zero-rpc.dev'),
  FEE_COLLECTION_ADDRESS: z.string().startsWith("0x").optional().default('0xfffeee'),

  ALCHEMY_API_URL: z.url(`https://dashboard.alchemy.com`),
  ALCHEMY_API_KEY: z.string(),

  // Rates API key
  MONIERATE_API_KEY: z.string().optional().default('naosdbvobodba'),

  // Switch keys
  SWITCH_API_URL: z.url(),
  SWITCH_API_KEY: z.string(),

  API_URL: z.url(),

  // nats server
  NATS_SERVER_URL: z.url(),
  NATS_USER_NKEY: z.string(),
  NATS_USER_JWT: z.string(),
  // Encryption key
  ENC_KEY: z.string().min(16).optional().default('sdonsdovbd'),

  // Google Auth
  GOOGLE_CLIENT_ID: z.string().optional().default('sdvadfvbasdf'),
  GOOGLE_CLIENT_SECRET: z.string().optional().default('asdvadvsdvasdvervasd'),

  // Github auth
  GITHUB_CLIENT_ID: z.string().optional().default('sdvadfvbasdf'),
  GITHUB_CLIENT_SECRET: z.string().optional().default('asdvadvsdvasdvervasd'
  ),
}).superRefine((input, ctx) => {
  if (input.NODE_ENV === "production" && !input.DATABASE_AUTH_TOKEN) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_type,
      expected: "string",
      received: "undefined",
      path: ["DATABASE_AUTH_TOKEN"],
      message: "Must be set when NODE_ENV is 'production'",
    });
  }
});

export type env = z.infer<typeof EnvSchema>;

// eslint-disable-next-line ts/no-redeclare
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
