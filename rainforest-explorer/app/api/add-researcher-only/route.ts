import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Add researcher_only column to all category tables if it doesn't exist
    await sql`
      DO $$
      BEGIN
          -- Add to trees table
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'trees' 
              AND column_name = 'researcher_only'
          ) THEN
              ALTER TABLE trees ADD COLUMN researcher_only BOOLEAN DEFAULT FALSE;
          END IF;
          
          -- Add to birds table
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'birds' 
              AND column_name = 'researcher_only'
          ) THEN
              ALTER TABLE birds ADD COLUMN researcher_only BOOLEAN DEFAULT FALSE;
          END IF;
          
          -- Add to animals table
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'animals' 
              AND column_name = 'researcher_only'
          ) THEN
              ALTER TABLE animals ADD COLUMN researcher_only BOOLEAN DEFAULT FALSE;
          END IF;
          
          -- Add to tribes table
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'tribes' 
              AND column_name = 'researcher_only'
          ) THEN
              ALTER TABLE tribes ADD COLUMN researcher_only BOOLEAN DEFAULT FALSE;
          END IF;
          
          -- Add to terrain table
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'terrain' 
              AND column_name = 'researcher_only'
          ) THEN
              ALTER TABLE terrain ADD COLUMN researcher_only BOOLEAN DEFAULT FALSE;
          END IF;
      END $$;
    `

    return NextResponse.json({
      success: true,
      message: "Added researcher_only column to all category tables",
    })
  } catch (error) {
    console.error("Error adding researcher_only column:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
