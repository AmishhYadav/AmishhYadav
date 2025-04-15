import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Check if users table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `

    if (!tableExists[0].exists) {
      // Create users table if it doesn't exist
      await sql`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255),
          user_type VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
      return NextResponse.json({
        success: true,
        message: "Users table created successfully",
      })
    }

    // Check if users_new table already exists (from a previous failed attempt)
    const usersNewExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users_new'
      );
    `

    // If users_new exists, drop it first
    if (usersNewExists[0].exists) {
      console.log("users_new table already exists, dropping it first")
      await sql`DROP TABLE users_new;`
    }

    // Check the data type of the id column
    const idColumnType = await sql`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id';
    `

    // If id column is integer, we need to alter it to text
    if (idColumnType.length > 0 && idColumnType[0].data_type === "integer") {
      // First, check for foreign key constraints referencing the users table
      const foreignKeys = await sql`
        SELECT
          tc.constraint_name,
          tc.table_name AS referencing_table,
          kcu.column_name AS referencing_column
        FROM
          information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE
          tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'users'
          AND ccu.column_name = 'id';
      `

      console.log("Foreign key constraints:", foreignKeys)

      // Create a new users table with the correct structure
      await sql`
        CREATE TABLE users_new (
          id TEXT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255),
          user_type VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `

      // Copy data from old table to new table with type conversion
      await sql`
        INSERT INTO users_new (id, email, name, user_type, created_at)
        SELECT id::TEXT, email, name, user_type, created_at FROM users;
      `

      // For each foreign key constraint, create a new table with updated structure
      for (const fk of foreignKeys) {
        const referencingTable = fk.referencing_table
        const referencingColumn = fk.referencing_column
        const constraintName = fk.constraint_name

        // Check if temporary table already exists
        const tempTableExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = ${referencingTable + "_new"}
          );
        `

        // If temporary table exists, drop it first
        if (tempTableExists[0].exists) {
          console.log(`${referencingTable}_new table already exists, dropping it first`)
          await sql.query(`DROP TABLE ${referencingTable}_new;`)
        }

        // Get the structure of the referencing table
        const tableColumns = await sql`
          SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = ${referencingTable}
          ORDER BY ordinal_position;
        `

        // Create a new table with the same structure but TEXT for the foreign key column
        let createTableSQL = `CREATE TABLE ${referencingTable}_new (`
        const columnDefs = []

        for (const col of tableColumns) {
          let columnDef = `${col.column_name} `

          // If this is the foreign key column, make it TEXT
          if (col.column_name === referencingColumn) {
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

        // Execute the create table statement
        await sql.query(createTableSQL)

        // Copy data with type conversion for the foreign key column
        let insertSQL = `INSERT INTO ${referencingTable}_new SELECT `
        const selectColumns = tableColumns.map((col) => {
          if (col.column_name === referencingColumn) {
            return `${col.column_name}::TEXT`
          }
          return col.column_name
        })

        insertSQL += selectColumns.join(", ") + ` FROM ${referencingTable}`

        // Execute the insert statement
        await sql.query(insertSQL)
      }

      // Rename tables
      await sql`ALTER TABLE users RENAME TO users_old;`
      await sql`ALTER TABLE users_new RENAME TO users;`

      // Rename and update foreign key tables
      for (const fk of foreignKeys) {
        const referencingTable = fk.referencing_table

        // Rename the old table
        await sql.query(`ALTER TABLE ${referencingTable} RENAME TO ${referencingTable}_old;`)

        // Rename the new table
        await sql.query(`ALTER TABLE ${referencingTable}_new RENAME TO ${referencingTable};`)

        // Add the foreign key constraint to the new table
        await sql.query(`
          ALTER TABLE ${referencingTable} 
          ADD CONSTRAINT ${fk.constraint_name} 
          FOREIGN KEY (${fk.referencing_column}) 
          REFERENCES users(id);
        `)
      }

      return NextResponse.json({
        success: true,
        message: "Users table and related tables updated successfully with correct ID type.",
      })
    }

    // Check if user_type column exists (it might be userType in some implementations)
    const userTypeExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'user_type'
      );
    `

    if (!userTypeExists[0].exists) {
      // Check if userType column exists (camelCase version)
      const camelCaseExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'usertype'
        );
      `

      if (!camelCaseExists[0].exists) {
        // Add user_type column if neither exists
        await sql`
          ALTER TABLE users ADD COLUMN user_type VARCHAR(50) DEFAULT 'guest' NOT NULL;
        `
      } else {
        // Rename userType to user_type for consistency
        await sql`
          ALTER TABLE users RENAME COLUMN usertype TO user_type;
        `
      }
    }

    return NextResponse.json({
      success: true,
      message: "Users table schema verified and fixed if needed",
    })
  } catch (error) {
    console.error("Error fixing users table:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
