"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, AlertCircle, Users, Database, Key, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function FixUsersPage() {
  const [loading, setLoading] = useState(false)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [cleanupLoading, setCleanupLoading] = useState(false)
  const [checkLoading, setCheckLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [sessionsStatus, setSessionsStatus] = useState<"idle" | "success" | "error">("idle")
  const [cleanupStatus, setCleanupStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [sessionsMessage, setSessionsMessage] = useState("")
  const [cleanupMessage, setCleanupMessage] = useState("")
  const [schemaInfo, setSchemaInfo] = useState<any>(null)
  const { toast } = useToast()

  const handleFixUsers = async () => {
    setLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/fix-users-table", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        setStatus("success")
        setMessage(result.message || "Users table fixed successfully")
        toast({
          title: "Success",
          description: "Users table has been fixed successfully.",
        })
      } else {
        setStatus("error")
        setMessage(result.error || "Failed to fix users table")
        toast({
          title: "Error",
          description: result.error || "Failed to fix users table.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fixing users table:", error)
      setStatus("error")
      setMessage("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFixSessions = async () => {
    setSessionsLoading(true)
    setSessionsStatus("idle")
    setSessionsMessage("")

    try {
      const response = await fetch("/api/fix-sessions-table", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        setSessionsStatus("success")
        setSessionsMessage(result.message || "Sessions table fixed successfully")
        toast({
          title: "Success",
          description: "Sessions table has been fixed successfully.",
        })
      } else {
        setSessionsStatus("error")
        setSessionsMessage(result.error || "Failed to fix sessions table")
        toast({
          title: "Error",
          description: result.error || "Failed to fix sessions table.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fixing sessions table:", error)
      setSessionsStatus("error")
      setSessionsMessage("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setSessionsLoading(false)
    }
  }

  const handleCleanupTables = async () => {
    setCleanupLoading(true)
    setCleanupStatus("idle")
    setCleanupMessage("")

    try {
      const response = await fetch("/api/cleanup-temp-tables", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        setCleanupStatus("success")
        setCleanupMessage(result.message || "Temporary tables cleaned up successfully")
        toast({
          title: "Success",
          description: "Temporary tables have been cleaned up successfully.",
        })
      } else {
        setCleanupStatus("error")
        setCleanupMessage(result.error || "Failed to clean up temporary tables")
        toast({
          title: "Error",
          description: result.error || "Failed to clean up temporary tables.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cleaning up temporary tables:", error)
      setCleanupStatus("error")
      setCleanupMessage("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setCleanupLoading(false)
    }
  }

  const handleCheckSchema = async () => {
    setCheckLoading(true)
    setSchemaInfo(null)

    try {
      const response = await fetch("/api/check-schema")
      const result = await response.json()

      if (result.success) {
        setSchemaInfo(result.schema)
        toast({
          title: "Schema Check Complete",
          description: "Database schema information retrieved successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to check schema.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking schema:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setCheckLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-green-800 text-center">Fix Database Tables</h1>
        <p className="mb-8 text-gray-600 text-center">
          Use this page to fix database schema issues and ensure authentication works properly.
        </p>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Check Database Schema</CardTitle>
              <CardDescription>This will check the current database schema without making any changes.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCheckSchema}
                disabled={checkLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
              >
                {checkLoading ? "Checking Schema..." : "Check Schema"}
                <Database className="ml-2 h-4 w-4" />
              </Button>

              {schemaInfo && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md overflow-auto max-h-60">
                  <h3 className="font-medium mb-2">Schema Information:</h3>
                  <pre className="text-xs">{JSON.stringify(schemaInfo, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clean Up Temporary Tables</CardTitle>
              <CardDescription>
                This will remove any leftover temporary tables from previous fix attempts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCleanupTables}
                disabled={cleanupLoading}
                className="w-full bg-red-600 hover:bg-red-700 mb-4"
              >
                {cleanupLoading ? "Cleaning Up..." : "Clean Up Temporary Tables"}
                <Trash2 className="ml-2 h-4 w-4" />
              </Button>

              {cleanupStatus === "success" && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{cleanupMessage}</AlertDescription>
                </Alert>
              )}

              {cleanupStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{cleanupMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fix Sessions Table</CardTitle>
              <CardDescription>
                This will fix the sessions table to work with the users table (recommended to run first).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleFixSessions}
                disabled={sessionsLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
              >
                {sessionsLoading ? "Fixing Sessions Table..." : "Fix Sessions Table"}
                <Key className="ml-2 h-4 w-4" />
              </Button>

              {sessionsStatus === "success" && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{sessionsMessage}</AlertDescription>
                </Alert>
              )}

              {sessionsStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{sessionsMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fix Users Table</CardTitle>
              <CardDescription>
                This will fix the users table schema to ensure it works with authentication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleFixUsers}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 mb-4"
              >
                {loading ? "Fixing Users Table..." : "Fix Users Table"}
                <Users className="ml-2 h-4 w-4" />
              </Button>

              {status === "success" && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {status === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4">
            <Link href="/admin">
              <Button variant="outline">Back to Admin</Button>
            </Link>
            <Link href="/">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
