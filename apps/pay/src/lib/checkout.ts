import db from "#/db"
import { createCheckout } from "@baggit/core"


export const checkout = createCheckout(db)
