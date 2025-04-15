"use client"

import { useState, useEffect } from "react"
import { getExplorerPoints } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DebugPage() {
  const [points, setPoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoading(true)
        const { success, data, error } = await getExplorerPoints()

        if (success && data) {
          setPoints(data)
        } else {
          setError(error || "Failed to fetch explorer points")
        }
      } catch (err) {
        console.error("Error fetching points:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchPoints()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-green-800 text-center">Debug Explorer Points</h1>

        <div className="mb-6 flex justify-center space-x-4">
          <Link href="/admin">
            <Button variant="outline">Back to Admin</Button>
          </Link>
          <Link href="/admin/seed">
            <Button>Go to Seed Page</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Explorer Points ({points.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md text-red-800">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
              </div>
            ) : points.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
                <p>No explorer points found in the database.</p>
                <p className="mt-2">
                  Please go to the{" "}
                  <Link href="/admin/seed" className="underline">
                    Seed Page
                  </Link>{" "}
                  to add explorer points.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Title</th>
                      <th className="border p-2 text-left">Icon</th>
                      <th className="border p-2 text-left">Position X</th>
                      <th className="border p-2 text-left">Position Y</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((point) => (
                      <tr key={point.id} className="hover:bg-gray-50">
                        <td className="border p-2">{point.title}</td>
                        <td className="border p-2">{point.icon}</td>
                        <td className="border p-2">{point.positionX}</td>
                        <td className="border p-2">{point.positionY}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
