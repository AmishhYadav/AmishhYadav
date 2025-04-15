"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Leaf, Bird, Bug, Droplets, LogOut, Users, X, ArrowLeft, Mountain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getExplorerPoints } from "@/lib/actions"
import { getItemsByCategory } from "@/lib/category-actions"
import { useAuth } from "@/contexts/auth-context"

type ExplorerPoint = {
  id: string
  title: string
  description: string
  icon: string
  positionX: string
  positionY: string
}

type CategoryItem = {
  id: string
  name: string
  scientific_name?: string
  description: string
  image_url: string
  researcher_only?: boolean
  [key: string]: any // Allow for category-specific fields
}

export default function RainforestExplorer() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [explorerPoints, setExplorerPoints] = useState<ExplorerPoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<ExplorerPoint | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<string>("")
  const [selectedItem, setSelectedItem] = useState<CategoryItem | null>(null)
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [pointsLoading, setPointsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Map icon names to category names
  const iconToCategoryMap: Record<string, string> = {
    Leaf: "trees",
    Bird: "birds",
    Bug: "animals",
    Users: "tribes",
    Droplets: "terrain",
    Mountain: "terrain",
  }

  // Fetch explorer points on component mount
  useEffect(() => {
    const fetchPoints = async () => {
      setPointsLoading(true)
      setError(null)
      try {
        const { success, data, error } = await getExplorerPoints()
        if (success && data) {
          console.log("Fetched explorer points:", data)
          setExplorerPoints(data)
        } else {
          console.error("Failed to fetch explorer points:", error)
          setError(error || "Failed to fetch explorer points")
        }
      } catch (error) {
        console.error("Error fetching explorer points:", error)
        setError("An unexpected error occurred")
      } finally {
        setPointsLoading(false)
      }
    }

    fetchPoints()
  }, [])

  // Fetch items when category changes
  useEffect(() => {
    if (currentCategory) {
      fetchCategoryItems(currentCategory)
    }
  }, [currentCategory])

  // Function to fetch category items
  const fetchCategoryItems = async (category: string) => {
    setLoading(true)
    try {
      const isResearcher = user?.userType === "researcher"
      const { success, data, error } = await getItemsByCategory(category, isResearcher)

      if (success && data) {
        console.log(`Fetched ${category} items:`, data)
        setCategoryItems(data)
      } else {
        console.error(`Error fetching ${category} items:`, error)
        setCategoryItems([])
      }
    } catch (error) {
      console.error("Error fetching category items:", error)
      setCategoryItems([])
    } finally {
      setLoading(false)
    }
  }

  // Add a function to check if the user is a researcher
  const isResearcher = () => {
    return user?.userType === "researcher"
  }

  // Get the appropriate title based on the current category
  const getCategoryTitle = (): string => {
    switch (currentCategory) {
      case "trees":
        return "Rainforest Tree Species"
      case "birds":
        return "Tropical Birds"
      case "animals":
        return "Rainforest Animals"
      case "tribes":
        return "Indigenous Tribes"
      case "terrain":
        return "Rainforest Terrain"
      default:
        return ""
    }
  }

  // Get the appropriate icon based on the current category
  const getCategoryIcon = (): React.ReactNode => {
    switch (currentCategory) {
      case "trees":
        return <Leaf className="h-6 w-6 mr-2 text-green-600" />
      case "birds":
        return <Bird className="h-6 w-6 mr-2 text-green-600" />
      case "animals":
        return <Bug className="h-6 w-6 mr-2 text-green-600" />
      case "tribes":
        return <Users className="h-6 w-6 mr-2 text-green-600" />
      case "terrain":
        return <Mountain className="h-6 w-6 mr-2 text-green-600" />
      default:
        return null
    }
  }

  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Leaf":
        return <Leaf className="h-7 w-7 group-hover:h-10 group-hover:w-10 transition-all duration-300" />
      case "Bird":
        return <Bird className="h-7 w-7 group-hover:h-10 group-hover:w-10 transition-all duration-300" />
      case "Bug":
        return <Bug className="h-7 w-7 group-hover:h-10 group-hover:w-10 transition-all duration-300" />
      case "Users":
        return <Users className="h-7 w-7 group-hover:h-10 group-hover:w-10 transition-all duration-300" />
      case "Droplets":
        return <Droplets className="h-7 w-7 group-hover:h-10 group-hover:w-10 transition-all duration-300" />
      case "Mountain":
        return <Mountain className="h-7 w-7 group-hover:h-10 group-hover:w-10 transition-all duration-300" />
      default:
        return <Leaf className="h-7 w-7 group-hover:h-10 group-hover:w-10 transition-all duration-300" />
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/") // Redirect to login page
  }

  const handlePointClick = (point: ExplorerPoint) => {
    // Map the icon name to the correct category name
    const category = iconToCategoryMap[point.icon] || "trees"
    setCurrentCategory(category)
    setShowCategoryModal(true)
    setSelectedItem(null)
  }

  const handleCloseModal = () => {
    setShowCategoryModal(false)
    setSelectedItem(null)
    setCurrentCategory("")
    setCategoryItems([])
  }

  const handleItemClick = (item: CategoryItem) => {
    setSelectedItem(item)
  }

  const handleBackToGrid = () => {
    setSelectedItem(null)
  }

  // Add a function to seed points if none are found
  const handleSeedPoints = async () => {
    try {
      // Redirect to the seed page
      router.push("/admin/seed")
    } catch (error) {
      console.error("Error navigating to seed page:", error)
    }
  }

  // Function to get category-specific details for display
  const getCategorySpecificDetails = (item: CategoryItem): Record<string, string> => {
    const details: Record<string, string> = {}

    // Common fields to exclude from details display
    const commonFields = [
      "id",
      "name",
      "scientific_name",
      "description",
      "image_url",
      "researcher_only",
      "created_at",
      "updated_at",
    ]

    // Add all non-common fields to details
    Object.entries(item).forEach(([key, value]) => {
      if (!commonFields.includes(key) && value !== null) {
        // Convert snake_case to Title Case for display
        const displayKey = key
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

        details[displayKey] = String(value)
      }
    })

    return details
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Rainforest Background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url('/emerald-canopy.png')`,
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md">DORA THE EXPLORER</h1>
            <p className="text-white/90 max-w-md drop-shadow-md">
              Join Dora on her adventure through the rainforest. Click on the markers to learn more.
            </p>
            {isResearcher() && (
              <div className="mt-2 inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <Leaf className="h-4 w-4 mr-1" />
                Researcher Mode Active
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="bg-white/80 hover:bg-white text-green-700 border-green-600 px-6 py-6 text-lg"
            size="lg"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Explorer Points */}
      <div className="relative z-10 h-full w-full">
        <TooltipProvider>
          {pointsLoading ? (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 p-6 rounded-lg shadow-lg max-w-md text-center">
              <h3 className="text-xl font-bold text-red-600 mb-2">Error Loading Explorer Points</h3>
              <p className="text-gray-800 mb-4">{error}</p>
              <Button onClick={handleSeedPoints} className="bg-green-600 hover:bg-green-700">
                Go to Seed Page
              </Button>
            </div>
          ) : explorerPoints.length === 0 ? (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 p-6 rounded-lg shadow-lg max-w-md text-center">
              <h3 className="text-xl font-bold text-amber-600 mb-2">No Explorer Points Found</h3>
              <p className="text-gray-800 mb-4">
                It looks like your database hasn't been seeded with explorer points yet.
              </p>
              <Button onClick={handleSeedPoints} className="bg-green-600 hover:bg-green-700">
                Go to Seed Page
              </Button>
            </div>
          ) : (
            explorerPoints.map((point) => (
              <Tooltip key={point.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="group absolute rounded-full bg-white/80 hover:bg-white border-2 border-green-600 
                    shadow-md transition-all duration-300 hover:scale-[1.8] hover:shadow-xl hover:border-green-500 
                    hover:z-30 w-14 h-14 hover:w-20 hover:h-20"
                    style={{
                      left: `${point.positionX}%`,
                      top: `${point.positionY}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 20,
                    }}
                    onClick={() => handlePointClick(point)}
                  >
                    {getIconComponent(point.icon)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-base font-medium">
                  <p>{point.title}</p>
                </TooltipContent>
              </Tooltip>
            ))
          )}
        </TooltipProvider>

        {/* Debug Explorer Points - Only visible in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="absolute bottom-4 left-4 z-50 bg-white/80 p-2 rounded text-xs">
            <p>Points: {explorerPoints.length}</p>
            <pre className="max-h-20 overflow-auto">
              {JSON.stringify(
                explorerPoints.map((p) => ({ title: p.title, x: p.positionX, y: p.positionY })),
                null,
                2,
              )}
            </pre>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseModal} />
          <motion.div
            className="relative w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-green-800 flex items-center">
                  {selectedItem ? (
                    <Button variant="ghost" size="lg" className="mr-2 p-2 h-12 w-12" onClick={handleBackToGrid}>
                      <ArrowLeft className="h-7 w-7 text-green-700" />
                    </Button>
                  ) : (
                    getCategoryIcon()
                  )}
                  {selectedItem ? selectedItem.name : getCategoryTitle()}
                </h2>
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full hover:bg-green-100 h-12 w-12"
                  onClick={handleCloseModal}
                >
                  <X className="h-7 w-7 text-green-800" />
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {selectedItem ? (
                  <motion.div
                    key="item-detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col md:flex-row gap-6"
                  >
                    <div className="md:w-1/2">
                      <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                        <Image
                          src={selectedItem.image_url || "/placeholder.svg"}
                          alt={selectedItem.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="md:w-1/2">
                      <h3 className="text-xl font-bold text-green-800 mb-1">{selectedItem.name}</h3>
                      {selectedItem.scientific_name && (
                        <p className={`text-sm italic ${isResearcher() ? "text-green-600" : "text-green-600/50"} mb-4`}>
                          {selectedItem.scientific_name}
                          {!isResearcher() && (
                            <span className="ml-2 text-amber-600 text-xs">
                              (Login as researcher to see full scientific details)
                            </span>
                          )}
                        </p>
                      )}

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-700">Description</h4>
                          <p className="text-gray-700">{selectedItem.description}</p>
                        </div>

                        {Object.entries(getCategorySpecificDetails(selectedItem)).map(([key, value]) => (
                          <div key={key}>
                            <h4 className="font-semibold text-green-700">{key}</h4>
                            {key.includes("Scientific") && !isResearcher() ? (
                              <p className="text-gray-500 italic">Login as researcher to view scientific details</p>
                            ) : (
                              <p className="text-gray-700">{value}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="item-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    {loading ? (
                      <div className="col-span-4 flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                      </div>
                    ) : categoryItems.length === 0 ? (
                      <div className="col-span-4 text-center py-12">
                        <p className="text-gray-500">No items found in this category.</p>
                      </div>
                    ) : (
                      categoryItems.map((item) => (
                        <motion.div
                          key={item.id}
                          className="bg-white/90 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                          whileHover={{ y: -5 }}
                          onClick={() => handleItemClick(item)}
                        >
                          <div className="relative h-40">
                            <Image
                              src={item.image_url || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-3 text-center">
                            <h3 className="font-bold text-green-800">{item.name}</h3>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
