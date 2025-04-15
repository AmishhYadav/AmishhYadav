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

    // Check the data type of the id column
    const idColumnType = await sql`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id';
    `

    // If id column is not text, we need to alter it
    if (idColumnType.length > 0 && idColumnType[0].data_type !== "text") {
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
        SELECT id::TEXT, email, name, user_type, created_at FROM users
        ON CONFLICT (id) DO NOTHING;
      `

      // Rename tables
      await sql`ALTER TABLE users RENAME TO users_old;`
      await sql`ALTER TABLE users_new RENAME TO users;`

      return NextResponse.json({
        success: true,
        message: "Users table updated with correct ID type",
      })
    }

    // Check if user_type column exists
    const userTypeExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'user_type'
      );
    `

    if (!userTypeExists[0].exists) {
      // Add user_type column if it doesn't exist
      await sql`
        ALTER TABLE users ADD COLUMN user_type VARCHAR(50) DEFAULT 'guest' NOT NULL;
      `
    }

    return NextResponse.json({
      success: true,
      message: "Users table schema verified and is correct",
    })
  } catch (error) {
    console.error("Error ensuring users table:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
