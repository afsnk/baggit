/**
 * Entities, shape data and types can also be gotten from the database schema
 */
import {z} from "zod"

export const checkoutFilterSchema = z.object({
	amount: z.number().optional(),
	date: z.string().optional(),
})
export type CheckoutFilterConfig = z.infer<typeof checkoutFilterSchema>
