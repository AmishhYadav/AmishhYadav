"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function SeedCategoriesPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const handleSeedCategories = async () => {
    setLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/seed-categories", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        setStatus("success")
        setMessage(result.message || "Categories seeded successfully")
        toast({
          title: "Success",
          description: "Category tables have been seeded successfully.",
        })
      } else {
        setStatus("error")
        setMessage(result.error || "Failed to seed categories")
        toast({
          title: "Error",
          description: result.error || "Failed to seed categories.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error seeding categories:", error)
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

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-green-800 text-center">Seed Category Tables</h1>
        <p className="mb-8 text-gray-600 text-center">
          Use this page to seed your category-specific tables with initial data.
        </p>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Seed Category Tables</CardTitle>
              <CardDescription>
                This will add sample data to your trees, birds, animals, tribes, and terrain tables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSeedCategories}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 mb-4"
              >
                {loading ? "Seeding..." : "Seed Category Tables"}
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
            <Link href="/explorer">
              <Button>Go to Explorer</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
