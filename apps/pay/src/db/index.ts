import { env } from "#/env"
import {createDB } from "@baggit/core/v1.0"



const db = createDB({
	url: env.DATABASE_URL,
	authToken: env.DATABASE_AUTH_TOKEN,
})

export default db;
