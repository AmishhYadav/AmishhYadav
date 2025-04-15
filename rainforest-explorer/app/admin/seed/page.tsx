"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { seedExplorerPoints, seedExplorerItems } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SeedPage() {
  const [pointsLoading, setPointsLoading] = useState(false)
  const [itemsLoading, setItemsLoading] = useState(false)
  const [pointsStatus, setPointsStatus] = useState<"idle" | "success" | "error">("idle")
  const [itemsStatus, setItemsStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const handleSeedPoints = async () => {
    setPointsLoading(true)
    setPointsStatus("idle")
    try {
      const result = await seedExplorerPoints()

      if (result.success) {
        setPointsStatus("success")
        toast({
          title: "Success",
          description: "Explorer points have been seeded successfully.",
        })
      } else {
        setPointsStatus("error")
        toast({
          title: "Error",
          description: result.error || "Failed to seed explorer points.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error seeding points:", error)
      setPointsStatus("error")
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setPointsLoading(false)
    }
  }

  const handleSeedItems = async () => {
    setItemsLoading(true)
    setItemsStatus("idle")
    setMessage("")
    try {
      const result = await seedExplorerItems()

      if (result.success) {
        setItemsStatus("success")
        setMessage(result.message || "")
        toast({
          title: "Success",
          description: "Explorer items have been seeded successfully.",
        })
      } else {
        setItemsStatus("error")
        toast({
          title: "Error",
          description: result.error || "Failed to seed explorer items.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error seeding items:", error)
      setItemsStatus("error")
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setItemsLoading(false)
    }
  }

  const handleSeedAll = async () => {
    await handleSeedPoints()
    await handleSeedItems()
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-green-800 text-center">Seed Database</h1>
        <p className="mb-8 text-gray-600 text-center">Use this page to seed your database with initial data.</p>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Seed All Data</CardTitle>
              <CardDescription>
                This will add all explorer points and items to your database in one step.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSeedAll}
                disabled={pointsLoading || itemsLoading}
                className="w-full bg-green-600 hover:bg-green-700 mb-4"
              >
                {pointsLoading || itemsLoading ? "Seeding..." : "Seed All Data"}
              </Button>

              {(pointsStatus === "success" || itemsStatus === "success") && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Database seeded successfully.
                    {message && <p className="mt-2 text-sm">{message}</p>}
                  </AlertDescription>
                </Alert>
              )}

              {(pointsStatus === "error" || itemsStatus === "error") && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    There was an error seeding the database. Please check the console for details.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Seed Explorer Points</CardTitle>
                <CardDescription>
                  This will add the default explorer points to your database if they don't already exist.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSeedPoints}
                  disabled={pointsLoading}
                  className="w-full"
                  variant={pointsStatus === "success" ? "outline" : "default"}
                >
                  {pointsLoading ? "Seeding..." : "Seed Explorer Points"}
                </Button>
                {pointsStatus === "success" && (
                  <p className="text-green-600 text-sm mt-2">Points seeded successfully!</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seed Explorer Items</CardTitle>
                <CardDescription>
                  This will add sample items for all categories (trees, birds, animals, tribes, terrain).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSeedItems}
                  disabled={itemsLoading}
                  className="w-full"
                  variant={itemsStatus === "success" ? "outline" : "default"}
                >
                  {itemsLoading ? "Seeding..." : "Seed Explorer Items"}
                </Button>
                {itemsStatus === "success" && <p className="text-green-600 text-sm mt-2">Items seeded successfully!</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
