"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { UserMenu } from "@/components/user-menu"
import {
  Upload,
  FileText,
  Brain,
  Coins,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Lock,
  Sparkles,
  TrendingUp,
  Shield,
  Database,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const DATA_CATEGORIES = [
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
  "ecommerce",
  "technology",
]

const ACCESS_DURATIONS = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "6 months" },
  { value: "365", label: "1 year" },
  { value: "unlimited", label: "Unlimited" },
]

interface AnalysisResult {
  summary: string
  categories: string[]
  dataQuality: string
  useCases: string[]
  suggestedPriceETH: string
  pricingReasoning: string
  sensitivityScore: number
  keyInsights: string[]
  recordCount: number
  columnCount: number
  dataTypes: string[]
  fileInfo: {
    name: string
    size: number
    type: string
    sizeFormatted: string
  }
  aiPowered: boolean
  timestamp: string
}

export default function UploadPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form data
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [price, setPrice] = useState("")
  const [accessDuration, setAccessDuration] = useState("30")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
    }
  }, [router])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError("")
      setAnalysis(null)
      setCurrentStep(1)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
      "text/plain": [".txt"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const analyzeData = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/analyze-data", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze data")
      }

      const result = await response.json()
      setAnalysis(result.analysis)

      // Auto-fill form fields based on AI analysis
      if (!title && result.analysis.fileInfo?.name) {
        setTitle(result.analysis.fileInfo.name.replace(/\.[^/.]+$/, ""))
      }

      if (!description && result.analysis.summary) {
        setDescription(result.analysis.summary.substring(0, 200) + "...")
      }

      // Auto-fill categories based on AI analysis
      if (result.analysis.categories && Array.isArray(result.analysis.categories)) {
        const validCategories = result.analysis.categories.filter((cat: string) =>
          DATA_CATEGORIES.includes(cat.toLowerCase()),
        )
        setCategories(validCategories)
      }

      // Auto-fill suggested price
      if (result.analysis.suggestedPriceETH) {
        setPrice(result.analysis.suggestedPriceETH)
      }

      setCurrentStep(2)
    } catch (err) {
      console.error("Analysis error:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze data")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setCategories([...categories, category])
    } else {
      setCategories(categories.filter((c) => c !== category))
    }
  }

  const mintNFT = async () => {
    if (!file || !analysis) return

    setIsMinting(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("description", description)
      formData.append("categories", JSON.stringify(categories))
      formData.append("price", price)
      formData.append("accessDuration", accessDuration)
      formData.append("analysis", JSON.stringify(analysis))

      const response = await fetch("/api/mint-nft", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to mint NFT")
      }

      const result = await response.json()
      setSuccess("NFT minted successfully!")
      setCurrentStep(3)

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (err) {
      console.error("Minting error:", err)
      setError(err instanceof Error ? err.message : "Failed to mint NFT")
    } finally {
      setIsMinting(false)
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setFile(null)
    setAnalysis(null)
    setTitle("")
    setDescription("")
    setCategories([])
    setPrice("")
    setAccessDuration("30")
    setError("")
    setSuccess("")
  }

  const getSensitivityColor = (score: number) => {
    if (score <= 2) return "bg-green-100 text-green-800"
    if (score <= 3) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getSensitivityLabel = (score: number) => {
    if (score <= 2) return "Low Sensitivity"
    if (score <= 3) return "Medium Sensitivity"
    return "High Sensitivity"
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
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/upload" className="text-blue-600 font-medium">
              Upload Data
            </Link>
          </nav>
          <UserMenu />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
              </div>
              <span className="font-medium">Upload & AI Analysis</span>
            </div>
            <div className={`w-16 h-1 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"} rounded`} />
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : "2"}
              </div>
              <span className="font-medium">Configure & Price</span>
            </div>
            <div className={`w-16 h-1 ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"} rounded`} />
            <div className={`flex items-center space-x-2 ${currentStep >= 3 ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {currentStep >= 3 ? <CheckCircle className="w-5 h-5" /> : "3"}
              </div>
              <span className="font-medium">Mint NFT</span>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Upload & AI Analysis */}
        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Data Upload & AI Analysis</span>
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Powered
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Upload your data file and get intelligent analysis with pricing suggestions powered by Google Gemini
                  AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div>
                  <Label className="text-base font-medium">Data File *</Label>
                  <div
                    {...getRootProps()}
                    className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : file
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    {file ? (
                      <div className="space-y-2">
                        <FileText className="w-12 h-12 text-green-600 mx-auto" />
                        <p className="text-green-800 font-medium">{file.name}</p>
                        <p className="text-sm text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Ready for AI Analysis
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-gray-600">
                          {isDragActive ? "Drop your file here" : "Drag & drop your data file here"}
                        </p>
                        <p className="text-sm text-gray-500">Supports CSV, JSON, TXT, Excel files up to 50MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button onClick={analyzeData} disabled={!file || isAnalyzing} className="w-full" size="lg">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI is analyzing your data...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* AI Analysis Results */}
            {analysis && (
              <div className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <span>AI Analysis Results</span>
                      {analysis.aiPowered && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Gemini AI
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Dataset Summary</h4>
                      <p className="text-gray-600 leading-relaxed">{analysis.summary}</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <Database className="w-5 h-5 text-blue-600 mb-2" />
                        <p className="text-sm text-blue-600 font-medium">Records</p>
                        <p className="text-2xl font-bold text-blue-800">{analysis.recordCount.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
                        <p className="text-sm text-green-600 font-medium">Columns</p>
                        <p className="text-2xl font-bold text-green-800">{analysis.columnCount}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <Coins className="w-5 h-5 text-purple-600 mb-2" />
                        <p className="text-sm text-purple-600 font-medium">Suggested Price</p>
                        <p className="text-2xl font-bold text-purple-800">{analysis.suggestedPriceETH} ETH</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <Shield className="w-5 h-5 text-orange-600 mb-2" />
                        <p className="text-sm text-orange-600 font-medium">Sensitivity</p>
                        <Badge className={`${getSensitivityColor(analysis.sensitivityScore)} text-xs`}>
                          {getSensitivityLabel(analysis.sensitivityScore)}
                        </Badge>
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Detected Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.categories.map((category, index) => (
                          <Badge key={index} variant="outline" className="capitalize">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Data Quality */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Data Quality Assessment</h4>
                      <p className="text-gray-600">{analysis.dataQuality}</p>
                    </div>

                    {/* Use Cases */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Potential Use Cases</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {analysis.useCases.map((useCase, index) => (
                          <li key={index}>{useCase}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Key Insights */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {analysis.keyInsights.map((insight, index) => (
                          <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Pricing Reasoning */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                        <Coins className="w-4 h-4 mr-2" />
                        AI Pricing Analysis
                      </h4>
                      <p className="text-yellow-700 text-sm">{analysis.pricingReasoning}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Configure & Price */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Dataset Configuration</CardTitle>
                <CardDescription>Configure your dataset details and pricing (pre-filled by AI)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter dataset title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your dataset"
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Categories * (AI Suggested)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {DATA_CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={categories.includes(category)}
                          onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                        />
                        <Label htmlFor={category} className="capitalize">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="price">Price (ETH) * (AI Suggested)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.0001"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.001"
                    className="mt-1"
                  />
                  {analysis?.pricingReasoning && (
                    <p className="text-sm text-gray-500 mt-1">AI Suggestion: {analysis.pricingReasoning}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="access-duration">Access Duration</Label>
                  <Select value={accessDuration} onValueChange={setAccessDuration}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCESS_DURATIONS.map((duration) => (
                        <SelectItem key={duration.value} value={duration.value}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={mintNFT}
                    disabled={!title || !price || categories.length === 0 || isMinting}
                    className="flex-1"
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Minting...
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 mr-2" />
                        Mint NFT
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Success */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="pt-8 pb-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">NFT Minted Successfully!</h2>
                <p className="text-gray-600 mb-6">
                  Your data has been successfully analyzed by AI, minted as an NFT, and is now available in the
                  marketplace.
                </p>
                <div className="flex space-x-4 justify-center">
                  <Button onClick={resetForm} variant="outline">
                    Upload Another
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard">View Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
