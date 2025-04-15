"use client"

import type React from "react"

import { useState } from "react"
import { createExplorerItem } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export default function AddExplorerItem() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    scientificName: "",
    description: "",
    imageUrl: "",
    category: "",
    researcherOnly: false,
    details: {} as Record<string, string>,
  })
  const [detailKey, setDetailKey] = useState("")
  const [detailValue, setDetailValue] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleResearcherOnlyChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, researcherOnly: checked }))
  }

  const addDetail = () => {
    if (detailKey && detailValue) {
      setFormData((prev) => ({
        ...prev,
        details: { ...prev.details, [detailKey]: detailValue },
      }))
      setDetailKey("")
      setDetailValue("")
    }
  }

  const removeDetail = (key: string) => {
    const newDetails = { ...formData.details }
    delete newDetails[key]
    setFormData((prev) => ({ ...prev, details: newDetails }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createExplorerItem({
        name: formData.name,
        scientificName: formData.scientificName,
        description: formData.description,
        imageUrl: formData.imageUrl,
        details: formData.details,
        category: formData.category,
        researcherOnly: formData.researcherOnly,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Item added successfully!",
        })

        // Reset form
        setFormData({
          name: "",
          scientificName: "",
          description: "",
          imageUrl: "",
          category: "",
          researcherOnly: false,
          details: {},
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add item.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding item:", error)
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Explorer Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scientificName">Scientific Name (optional)</Label>
            <Input
              id="scientificName"
              name="scientificName"
              value={formData.scientificName}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={handleCategoryChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trees">Trees</SelectItem>
                <SelectItem value="birds">Birds</SelectItem>
                <SelectItem value="animals">Animals</SelectItem>
                <SelectItem value="tribes">Tribes</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="researcher-only"
              checked={formData.researcherOnly}
              onCheckedChange={handleResearcherOnlyChange}
            />
            <Label htmlFor="researcher-only">Researcher Only Content</Label>
          </div>

          <div className="border p-4 rounded-md space-y-4">
            <h3 className="font-medium">Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="detailKey">Detail Name</Label>
                <Input id="detailKey" value={detailKey} onChange={(e) => setDetailKey(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="detailValue">Detail Value</Label>
                <div className="flex space-x-2">
                  <Input id="detailValue" value={detailValue} onChange={(e) => setDetailValue(e.target.value)} />
                  <Button type="button" onClick={addDetail} disabled={!detailKey || !detailValue} variant="outline">
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {Object.keys(formData.details).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Current Details:</h4>
                <div className="space-y-2">
                  {Object.entries(formData.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                      <Button type="button" onClick={() => removeDetail(key)} variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
