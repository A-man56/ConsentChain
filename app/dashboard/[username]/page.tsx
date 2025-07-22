"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserMenu } from "@/components/user-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Upload, DollarSign, TrendingUp, FileText, Calendar, Eye, Lock, ShoppingCart, Edit, Trash2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface DashboardStats {
  totalDatasets: number
  totalEarnings: number
  totalPurchases: number
  activeListings: number
}

interface Dataset {
  id: string
  title: string
  description: string
  categories: string[]
  price: number
  accessDuration: string
  createdAt: string
  views: number
  purchases: number
  status: string
  fileName: string
  fileSize: number
}

interface Purchase {
  id: string
  datasetTitle: string
  price: number
  purchaseDate: string
  accessExpiry: string
  status: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function UserDashboardPage() {
  const router = useRouter()
  const params = useParams()
  const username = params.username as string

  const [stats, setStats] = useState<DashboardStats>({
    totalDatasets: 0,
    totalEarnings: 0,
    totalPurchases: 0,
    activeListings: 0,
  })
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const currentUser = localStorage.getItem("userName") || localStorage.getItem("userEmail")?.split("@")[0]

    if (!token) {
      router.push("/auth/login")
      return
    }

    // Check if user is accessing their own dashboard
    if (currentUser !== username) {
      router.push(`/dashboard/${currentUser}`)
      return
    }

    fetchDashboardData()
  }, [router, username])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      // Fetch all dashboard data
      const [statsRes, datasetsRes, purchasesRes] = await Promise.all([
        fetch("/api/dashboard/stats", { headers }),
        fetch("/api/dashboard/datasets", { headers }),
        fetch("/api/dashboard/purchases", { headers }),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (datasetsRes.ok) {
        const datasetsData = await datasetsRes.json()
        // Ensure datasets is an array
        setDatasets(Array.isArray(datasetsData.datasets) ? datasetsData.datasets : [])
      }

      if (purchasesRes.ok) {
        const purchasesData = await purchasesRes.json()
        // Ensure purchases is an array
        setPurchases(Array.isArray(purchasesData.purchases) ? purchasesData.purchases : [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDataset = async (datasetId: string) => {
    if (!confirm("Are you sure you want to delete this dataset?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/datasets/${datasetId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setDatasets(datasets.filter((d) => d.id !== datasetId))
      } else {
        alert("Failed to delete dataset")
      }
    } catch (error) {
      alert("Error deleting dataset")
    }
  }

  // Safe category data calculation
  const categoryData = datasets.reduce(
    (acc, dataset) => {
      if (Array.isArray(dataset.categories)) {
        dataset.categories.forEach((category) => {
          acc[category] = (acc[category] || 0) + 1
        })
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }))

  const earningsData = datasets.map((dataset) => ({
    name: dataset.title.substring(0, 20) + "...",
    earnings: dataset.price * (dataset.purchases || 0),
  }))

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
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Retry
            </Button>
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
            <Link href="/marketplace" className="text-gray-600 hover:text-blue-600 transition-colors">
              Marketplace
            </Link>
            <Link href={`/dashboard/${username}`} className="text-blue-600 font-medium">
              Dashboard
            </Link>
            <Link href="/upload" className="text-gray-600 hover:text-blue-600 transition-colors">
              Upload Data
            </Link>
          </nav>
          <UserMenu />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{username}'s Dashboard</h1>
          <p className="text-gray-600">Manage your data assets and track your earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDatasets}</div>
              <p className="text-xs text-muted-foreground">Uploaded datasets</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEarnings.toFixed(3)} ETH</div>
              <p className="text-xs text-muted-foreground">From data sales</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchases Made</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPurchases}</div>
              <p className="text-xs text-muted-foreground">Data purchases</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeListings}</div>
              <p className="text-xs text-muted-foreground">Currently listed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {datasets.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Earnings by Dataset</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="earnings" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Dataset Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Your Datasets */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Datasets</CardTitle>
            <CardDescription>Manage your uploaded data assets</CardDescription>
          </CardHeader>
          <CardContent>
            {datasets.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No datasets uploaded yet</h3>
                <p className="text-gray-600 mb-4">Start by uploading your first dataset</p>
                <Button asChild>
                  <Link href="/upload">Upload Dataset</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datasets.map((dataset) => (
                    <TableRow key={dataset.id}>
                      <TableCell className="font-medium">{dataset.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(dataset.categories) &&
                            dataset.categories.slice(0, 2).map((category) => (
                              <Badge key={category} variant="secondary" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          {Array.isArray(dataset.categories) && dataset.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{dataset.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{dataset.price} ETH</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1 text-gray-400" />
                          {dataset.views || 0}
                        </div>
                      </TableCell>
                      <TableCell>{dataset.purchases || 0}</TableCell>
                      <TableCell>
                        <Badge variant={dataset.status === "active" ? "default" : "secondary"} className="capitalize">
                          {dataset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(dataset.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDataset(dataset.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Your Purchases */}
        <Card>
          <CardHeader>
            <CardTitle>Your Purchases</CardTitle>
            <CardDescription>Data you've purchased from other users</CardDescription>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
                <p className="text-gray-600 mb-4">Browse the marketplace to find valuable datasets</p>
                <Button asChild>
                  <Link href="/marketplace">Browse Marketplace</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dataset</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Access Expires</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.datasetTitle}</TableCell>
                      <TableCell>{purchase.price} ETH</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {new Date(purchase.accessExpiry).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={purchase.status === "active" ? "default" : "secondary"} className="capitalize">
                          {purchase.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
