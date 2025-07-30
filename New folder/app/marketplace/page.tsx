"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { UserMenu } from "@/components/user-menu"
import { Search, Filter, ShoppingCart, Eye, Calendar, User, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast" // Import useToast

interface Dataset {
  id: string
  title: string
  description: string
  categories: string[]
  price: number
  currency: string
  createdAt: string
  views: number
  purchases: number
  seller: string
  sellerName: string
  fileName: string
  fileSize: number
  accessDuration: number
}

export default function MarketplacePage() {
  const router = useRouter()
  const { toast } = useToast() // Initialize useToast
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const categories = [
    "all",
    "health",
    "location",
    "shopping",
    "browsing",
    "social",
    "financial",
    "fitness",
    "education",
    "entertainment",
    "productivity",
    "communication",
  ]

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
    fetchMarketplaceData()
  }, [])

  useEffect(() => {
    filterDatasets()
  }, [datasets, searchTerm, selectedCategory])

  const fetchMarketplaceData = async () => {
    try {
      const response = await fetch("/api/marketplace/nfts")

      if (response.ok) {
        const data = await response.json()
        setDatasets(Array.isArray(data.datasets) ? data.datasets : [])
      } else {
        console.error("Failed to fetch marketplace data")
        setDatasets([])
      }
    } catch (error) {
      console.error("Error fetching marketplace data:", error)
      setDatasets([])
    } finally {
      setLoading(false)
    }
  }

  const filterDatasets = () => {
    let filtered = datasets

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (dataset) =>
          dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dataset.categories.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((dataset) => dataset.categories.includes(selectedCategory))
    }

    setFilteredDatasets(filtered)
  }

  const handlePurchase = async (datasetId: string, price: number) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase datasets.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!confirm(`Are you sure you want to purchase this dataset for ${price} ETH?`)) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ datasetId }),
      })

      if (response.ok) {
        toast({
          title: "Purchase Successful!",
          description: "Check your dashboard for download access.",
          variant: "default",
        })
        fetchMarketplaceData() // Refresh data
      } else {
        const errorData = await response.json()
        toast({
          title: "Purchase Failed",
          description: errorData.message || "An unexpected error occurred.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Purchase network error:", error)
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ConsentChain
              </h1>
            </div>
            <UserMenu />
          </div>
        </header>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading marketplace...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ConsentChain
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/marketplace" className="text-blue-600 font-medium">
              Marketplace
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  href={`/dashboard/${localStorage.getItem("userName") || localStorage.getItem("userEmail")?.split("@")[0]}`}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link href="/upload" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Upload Data
                </Link>
              </>
            )}
          </nav>
          <UserMenu />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Marketplace</h1>
          <p className="text-gray-600">Discover and purchase valuable datasets from the community</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredDatasets.length} dataset{filteredDatasets.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Datasets Grid */}
        {filteredDatasets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No datasets found</h3>
              <p className="text-gray-600 text-center mb-4">
                {datasets.length === 0
                  ? "No datasets are currently available in the marketplace"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {isLoggedIn && (
                <Button asChild>
                  <Link href="/upload">Upload Your Dataset</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatasets.map((dataset) => (
              <Card key={dataset.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{dataset.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {dataset.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {dataset.price} {dataset.currency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-1">
                    {dataset.categories.slice(0, 3).map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {dataset.categories.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{dataset.categories.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1 text-gray-400" />
                      <span>{dataset.views || 0} views</span>
                    </div>
                    <div className="flex items-center">
                      <ShoppingCart className="w-4 h-4 mr-1 text-gray-400" />
                      <span>{dataset.purchases || 0} sales</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1 text-gray-400" />
                      <span>{dataset.sellerName || dataset.seller}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      <span>{new Date(dataset.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="text-sm text-gray-600 border-t pt-3">
                    <div className="flex justify-between">
                      <span>File: {dataset.fileName}</span>
                      <span>{formatFileSize(dataset.fileSize)}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Access Duration:</span>
                      <span>{dataset.accessDuration} days</span>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <Button
                    onClick={() => handlePurchase(dataset.id, dataset.price)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {isLoggedIn ? `Buy for ${dataset.price} ${dataset.currency}` : "Login to Purchase"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
