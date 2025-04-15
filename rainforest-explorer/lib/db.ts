import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a database connection
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)
