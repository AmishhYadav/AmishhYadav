import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Create the SQL function to set up tables
    const { error: functionError } = await supabase.rpc("create_explorer_items_table_function", {
      sql_function: `
        CREATE OR REPLACE FUNCTION create_explorer_items_table()
        RETURNS void AS $$
        BEGIN
          -- Create explorer_items table if it doesn't exist
          CREATE TABLE IF NOT EXISTS explorer_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            scientific_name TEXT,
            description TEXT NOT NULL,
            image_url TEXT NOT NULL,
            details JSONB NOT NULL,
            category TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create index on category for faster queries
          CREATE INDEX IF NOT EXISTS explorer_items_category_idx ON explorer_items(category);
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    if (functionError) {
      throw new Error(`Error creating function: ${functionError.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
