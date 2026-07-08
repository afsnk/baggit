import {z} from "zod";
import apiApp from "./api.app"
import authApp from "./auth.app"
import { selectTransactions, transactions } from "./Core/DB/schema";


export type APIApp = typeof apiApp;
export type AuthApp = typeof authApp;
export type Transaction = z.infer<typeof selectTransactions>
