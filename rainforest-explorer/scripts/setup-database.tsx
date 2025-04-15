"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function SetupDatabase() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const setupDatabase = async () => {
    setLoading(true)
    setMessage("Setting up database...")

    try {
      // Create explorer_items table
      const { error: createTableError } = await supabase.rpc("create_explorer_items_table")

      if (createTableError) {
        throw new Error(`Error creating table: ${createTableError.message}`)
      }

      setMessage("Database setup complete!")
    } catch (error) {
      console.error("Setup error:", error)
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Database Setup</h1>
      <Button onClick={setupDatabase} disabled={loading} className="w-full mb-4">
        {loading ? "Setting up..." : "Setup Database"}
      </Button>
      {message && (
        <div className="p-4 border rounded bg-gray-50">
          <p>{message}</p>
        </div>
      )}
    </div>
  )
}
