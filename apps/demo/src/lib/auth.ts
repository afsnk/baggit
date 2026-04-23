import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    type: "sqlite",
    file: ":memory:",
  },
  emailAndPassword: {
    enabled: true,
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;
