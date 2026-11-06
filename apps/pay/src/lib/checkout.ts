import db from "#/db"
import { createCheckout } from "@baggit/core/v1.0"


export const checkout = createCheckout(db)
