import createApp from "@/Core/Lib/create-app";
import { auth } from "@/Core/Config/auth";
import { cors } from "@elysia/cors"
import env from "./Core/Config/env";
import { appMacro } from "./Core/Lib/macros";



const authApp = createApp({ name: "auth" })
  .use(
    cors({
      origin: [
        ...env.TRUSTED_ORIGINS.split(',')
      ],
      methods: ["POST", "OPTIONS", "POST", "HEAD", "PATCH", "OPTIONS"],
      credentials: true,
      allowedHeaders: "*"
    })
  )
  .mount(auth.handler)
  .macro(appMacro)
  .get(`/user`, async ({ user }) => user, { auth: true })
  .listen({port: 8002, hostname: "::"})

console.log(`Auth server running at [${authApp.server?.hostname}:${authApp.server?.port}]`)

export default authApp
