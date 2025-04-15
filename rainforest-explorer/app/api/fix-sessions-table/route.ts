import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Check if sessions table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sessions'
      );
    `

    if (!tableExists[0].exists) {
      return NextResponse.json({
        success: true,
        message: "Sessions table does not exist, no action needed.",
      })
    }

    // Check if sessions_new table already exists (from a previous failed attempt)
    const sessionsNewExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sessions_new'
      );
    `

    // If sessions_new exists, drop it first
    if (sessionsNewExists[0].exists) {
      console.log("sessions_new table already exists, dropping it first")
      await sql`DROP TABLE sessions_new;`
    }

    // Get the actual structure of the sessions table
    const sessionsColumns = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'sessions'
      ORDER BY ordinal_position;
    `

    console.log("Sessions table columns:", sessionsColumns)

    // Check if the user_id column exists and is an integer
    const userIdColumn = sessionsColumns.find((col) => col.column_name === "user_id")

    if (!userIdColumn) {
      return NextResponse.json({
        success: true,
        message: "Sessions table does not have a user_id column, no action needed.",
      })
    }

    if (userIdColumn.data_type !== "integer") {
      return NextResponse.json({
        success: true,
        message: `Sessions table user_id is already ${userIdColumn.data_type}, no action needed.`,
      })
    }

    // Drop the foreign key constraint
    const foreignKeyConstraint = await sql`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'sessions' AND constraint_type = 'FOREIGN KEY';
    `

    if (foreignKeyConstraint.length > 0) {
      await sql.query(`ALTER TABLE sessions DROP CONSTRAINT ${foreignKeyConstraint[0].constraint_name};`)
    }

    // Create a new sessions table with the same structure but TEXT user_id
    let createTableSQL = `CREATE TABLE sessions_new (`
    const columnDefs = []

    for (const col of sessionsColumns) {
      let columnDef = `${col.column_name} `

      // If this is the user_id column, make it TEXT
      if (col.column_name === "user_id") {
        columnDef += `TEXT`
      } else {
        columnDef += `${col.data_type}`

        // Add length for character types
        if (col.character_maximum_length && col.data_type.includes("char")) {
          columnDef += `(${col.character_maximum_length})`
        }
      }

      // Add NULL constraint
      if (col.is_nullable === "NO") {
        columnDef += ` NOT NULL`
      }

      // Add default value if exists
      if (col.column_default) {
        columnDef += ` DEFAULT ${col.column_default}`
      }

      columnDefs.push(columnDef)
    }

    createTableSQL += columnDefs.join(", ") + ")"
    console.log("Create table SQL:", createTableSQL)

    // Execute the create table statement
    await sql.query(createTableSQL)

    // Copy data with type conversion for the user_id column
    let insertSQL = `INSERT INTO sessions_new SELECT `
    const selectColumns = sessionsColumns.map((col) => {
      if (col.column_name === "user_id") {
        return `${col.column_name}::TEXT`
      }
      return col.column_name
    })

    insertSQL += selectColumns.join(", ") + ` FROM sessions`
    console.log("Insert SQL:", insertSQL)

    // Execute the insert statement
    await sql.query(insertSQL)

    // Rename tables
    await sql`ALTER TABLE sessions RENAME TO sessions_old;`
    await sql`ALTER TABLE sessions_new RENAME TO sessions;`

    // Add the foreign key constraint back
    await sql`
      ALTER TABLE sessions
      ADD CONSTRAINT sessions_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES users(id);
    `

    return NextResponse.json({
      success: true,
      message: "Sessions table updated successfully with TEXT user_id.",
    })
  } catch (error) {
    console.error("Error fixing sessions table:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
