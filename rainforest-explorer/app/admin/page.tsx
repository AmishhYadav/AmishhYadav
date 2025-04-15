import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Database, Plus, Bug, PenToolIcon as Tool, Users } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-green-800 text-center">Rainforest Explorer Admin</h1>
        <p className="mb-8 text-gray-600 text-center">Manage your Rainforest Explorer database and content</p>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Database className="mr-2 h-5 w-5" />
                Seed Database
              </CardTitle>
              <CardDescription>
                Populate your database with explorer points and sample items for all categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/seed">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Leaf className="mr-2 h-4 w-4" />
                  Seed Database
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Item</CardTitle>
              <CardDescription>Add new explorer items to the database</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/add-item">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Explorer</CardTitle>
              <CardDescription>Go to the explorer interface</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/explorer">
                <Button className="w-full" variant="outline">
                  View Explorer
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Debug Database</CardTitle>
              <CardDescription>Check database content and troubleshoot issues</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/debug">
                <Button className="w-full" variant="outline">
                  <Bug className="mr-2 h-4 w-4" />
                  Debug
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seed Category Tables</CardTitle>
              <CardDescription>Populate the category-specific tables with sample data</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/seed-categories">
                <Button className="w-full">
                  <Leaf className="mr-2 h-4 w-4" />
                  Seed Categories
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fix Database Schema</CardTitle>
              <CardDescription>Add missing columns to all category tables</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
              <form action="/api/add-researcher-only" method="post">
                <Button type="submit" className="w-full" variant="outline">
                  <Tool className="mr-2 h-4 w-4" />
                  Add Researcher Column
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fix Users Table</CardTitle>
              <CardDescription>Fix the users table schema for proper authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/fix-users">
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Fix Users Table
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ensure Users Table</CardTitle>
              <CardDescription>Make sure the users table exists and has the correct structure</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
              <form action="/api/ensure-users-table" method="post">
                <Button type="submit" className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Ensure Users Table
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
