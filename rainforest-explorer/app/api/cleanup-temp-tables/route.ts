import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Get a list of all tables in the database
    const allTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `

    const tablesToDrop = []

    // Find tables that end with _new or _old
    for (const table of allTables) {
      if (table.table_name.endsWith("_new") || table.table_name.endsWith("_old")) {
        tablesToDrop.push(table.table_name)
      }
    }

    // Drop the temporary tables
    for (const tableName of tablesToDrop) {
      console.log(`Dropping temporary table: ${tableName}`)
      await sql.query(`DROP TABLE IF EXISTS ${tableName};`)
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${tablesToDrop.length} temporary tables: ${tablesToDrop.join(", ")}`,
      droppedTables: tablesToDrop,
    })
  } catch (error) {
    console.error("Error cleaning up temporary tables:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
