import createApp from "@/Core/Lib/create-app";
import { auth } from "@/Core/Config/auth";
import { cors } from "@elysia/cors"
import env from "./Core/Config/env";
import { appMacro } from "./Core/Lib/macros";



const authApp = createApp({ name: "auth" })
  .use(
    cors({
      origin: [
        ...env.TRUSTED_ORIGINS.split(','),
        'http://localhost:3011',
        'http://localhost:3000',
        'https://widget.baggit.link',
        'https://baggit.link',
        'localhost:3000',
        'localhost:3001',
        'localhost:3011',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )
  .mount(auth.handler)
  .macro(appMacro)
  .get(`/user`, ({ user }) => user, { auth: true })
  .listen(8002)

console.log(`Auth server running at ${authApp.server?.hostname}:${authApp.server?.port}`)
