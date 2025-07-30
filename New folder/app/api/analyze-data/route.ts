import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const authHeader = request.headers.get("authorization")
    let userId = null

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key") as any
        userId = decoded.userId
        console.log("Analyzing data for user:", userId)
      } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
    } else {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("Analyzing file:", file.name, "Size:", file.size, "Type:", file.type)

    try {
      // Read file content for analysis
      const fileContent = await file.text()

      // Basic file info
      const fileSizeKB = Math.round(file.size / 1024)
      const fileSizeMB = Math.round(file.size / (1024 * 1024))

      // Prepare content for Gemini analysis
      let analysisPrompt = ""
      let sampleData = ""

      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        const lines = fileContent.split("\n").filter((line) => line.trim())
        const headers = lines[0] ? lines[0].split(",").map((h) => h.trim()) : []
        sampleData = lines.slice(0, Math.min(10, lines.length)).join("\n")

        analysisPrompt = `
Analyze this CSV dataset and provide detailed insights:

File: ${file.name}
Size: ${fileSizeMB > 0 ? fileSizeMB + "MB" : fileSizeKB + "KB"}
Headers: ${headers.join(", ")}
Sample Data (first 10 rows):
${sampleData}

Please provide:
1. A comprehensive summary of what this dataset contains
2. The main categories/domains this data belongs to (health, finance, location, social, etc.)
3. Data quality assessment (completeness, consistency, potential issues)
4. Potential use cases and applications
5. Market value assessment and suggested pricing in ETH (consider data rarity, quality, size, and commercial value)
6. Data sensitivity level (1-5, where 5 is highly sensitive)
7. Key insights and patterns you can identify

Format your response as JSON with these fields:
{
  "summary": "detailed description",
  "categories": ["category1", "category2"],
  "dataQuality": "assessment of data quality",
  "useCases": ["use case 1", "use case 2"],
  "suggestedPriceETH": "0.001",
  "pricingReasoning": "explanation for pricing",
  "sensitivityScore": 3,
  "keyInsights": ["insight 1", "insight 2"],
  "recordCount": ${Math.max(0, lines.length - 1)},
  "columnCount": ${headers.length},
  "dataTypes": ["type1", "type2"]
}
`
      } else if (file.type === "application/json" || file.name.endsWith(".json")) {
        try {
          const jsonData = JSON.parse(fileContent)
          const keys = Array.isArray(jsonData) && jsonData.length > 0 ? Object.keys(jsonData[0]) : Object.keys(jsonData)
          sampleData = JSON.stringify(Array.isArray(jsonData) ? jsonData.slice(0, 5) : jsonData, null, 2)

          analysisPrompt = `
Analyze this JSON dataset and provide detailed insights:

File: ${file.name}
Size: ${fileSizeMB > 0 ? fileSizeMB + "MB" : fileSizeKB + "KB"}
Fields: ${keys.join(", ")}
Sample Data:
${sampleData}

Please provide:
1. A comprehensive summary of what this dataset contains
2. The main categories/domains this data belongs to
3. Data quality assessment
4. Potential use cases and applications
5. Market value assessment and suggested pricing in ETH
6. Data sensitivity level (1-5)
7. Key insights and patterns

Format your response as JSON with these fields:
{
  "summary": "detailed description",
  "categories": ["category1", "category2"],
  "dataQuality": "assessment",
  "useCases": ["use case 1", "use case 2"],
  "suggestedPriceETH": "0.001",
  "pricingReasoning": "explanation",
  "sensitivityScore": 3,
  "keyInsights": ["insight 1", "insight 2"],
  "recordCount": ${Array.isArray(jsonData) ? jsonData.length : 1},
  "columnCount": ${keys.length},
  "dataTypes": ["type1", "type2"]
}
`
        } catch (parseError) {
          analysisPrompt = `
Analyze this file and provide insights:

File: ${file.name}
Size: ${fileSizeMB > 0 ? fileSizeMB + "MB" : fileSizeKB + "KB"}
Type: ${file.type}

The file appears to be JSON but couldn't be parsed. Please provide a general analysis and suggest pricing.

Format as JSON with summary, categories, suggestedPriceETH, etc.
`
        }
      } else {
        // For other file types
        const contentPreview = fileContent.substring(0, 1000)
        analysisPrompt = `
Analyze this dataset file and provide insights:

File: ${file.name}
Size: ${fileSizeMB > 0 ? fileSizeMB + "MB" : fileSizeKB + "KB"}
Type: ${file.type}
Content Preview:
${contentPreview}

Please provide comprehensive analysis and pricing suggestions.

Format your response as JSON with these fields:
{
  "summary": "detailed description",
  "categories": ["category1"],
  "dataQuality": "assessment",
  "useCases": ["use case 1"],
  "suggestedPriceETH": "0.001",
  "pricingReasoning": "explanation",
  "sensitivityScore": 3,
  "keyInsights": ["insight 1"],
  "recordCount": 0,
  "columnCount": 0,
  "dataTypes": ["mixed"]
}
`
      }

      // Call Gemini API for analysis
      let geminiAnalysis
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const result = await model.generateContent(analysisPrompt)
        const response = await result.response
        const analysisText = response.text()

        // Try to parse JSON response
        try {
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            geminiAnalysis = JSON.parse(jsonMatch[0])
          } else {
            throw new Error("No JSON found in response")
          }
        } catch (parseError) {
          console.error("Failed to parse Gemini response as JSON:", parseError)
          // Fallback analysis
          geminiAnalysis = {
            summary: analysisText.substring(0, 500) + "...",
            categories: ["general"],
            dataQuality: "Requires manual review",
            useCases: ["Data analysis", "Research"],
            suggestedPriceETH: "0.001",
            pricingReasoning: "Base pricing for unstructured data",
            sensitivityScore: 3,
            keyInsights: ["File uploaded successfully", "Manual analysis recommended"],
            recordCount: 0,
            columnCount: 0,
            dataTypes: ["mixed"],
          }
        }
      } catch (geminiError) {
        console.error("Gemini API error:", geminiError)
        // Fallback to basic analysis if Gemini fails
        geminiAnalysis = await performBasicAnalysis(file, fileContent)
      }

      // Enhance analysis with additional metadata
      const enhancedAnalysis = {
        ...geminiAnalysis,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          sizeFormatted: fileSizeMB > 0 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`,
        },
        timestamp: new Date().toISOString(),
        aiPowered: true,
      }

      console.log("AI Analysis completed:", enhancedAnalysis)

      return NextResponse.json({
        success: true,
        summary: enhancedAnalysis.summary,
        categories: enhancedAnalysis.categories,
        analysis: enhancedAnalysis,
      })
    } catch (analysisError) {
      console.error("Analysis error:", analysisError)
      return NextResponse.json(
        {
          error: "Failed to analyze file",
          details: analysisError instanceof Error ? analysisError.message : "Analysis error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Analyze data error:", error)
    return NextResponse.json(
      {
        error: "Failed to process file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Fallback analysis function
async function performBasicAnalysis(file: File, fileContent: string) {
  const fileSizeKB = Math.round(file.size / 1024)

  if (file.type === "text/csv" || file.name.endsWith(".csv")) {
    const lines = fileContent.split("\n").filter((line) => line.trim())
    const headers = lines[0] ? lines[0].split(",").map((h) => h.trim()) : []

    return {
      summary: `CSV dataset with ${lines.length - 1} records and ${headers.length} columns. Contains structured data suitable for analysis and machine learning applications.`,
      categories: detectBasicCategories(headers, fileContent),
      dataQuality: "Good - structured CSV format with clear headers",
      useCases: ["Data analysis", "Machine learning", "Business intelligence", "Research"],
      suggestedPriceETH: calculateBasicPrice(file.size, lines.length - 1),
      pricingReasoning: `Pricing based on ${lines.length - 1} records and ${fileSizeKB}KB size. CSV format adds value for data analysis.`,
      sensitivityScore: calculateSensitivityScore(headers, fileContent),
      keyInsights: [
        `Contains ${lines.length - 1} data records`,
        `${headers.length} data columns available`,
        "Structured format suitable for analysis",
      ],
      recordCount: Math.max(0, lines.length - 1),
      columnCount: headers.length,
      dataTypes: detectDataTypes(headers),
    }
  } else if (file.type === "application/json" || file.name.endsWith(".json")) {
    try {
      const jsonData = JSON.parse(fileContent)
      const recordCount = Array.isArray(jsonData) ? jsonData.length : 1
      const keys = Array.isArray(jsonData) && jsonData.length > 0 ? Object.keys(jsonData[0]) : Object.keys(jsonData)

      return {
        summary: `JSON dataset containing ${recordCount} record(s) with ${keys.length} fields. Well-structured data ready for API integration and analysis.`,
        categories: detectBasicCategories(keys, fileContent),
        dataQuality: "Good - valid JSON structure",
        useCases: ["API development", "Data integration", "Web applications", "Analytics"],
        suggestedPriceETH: calculateBasicPrice(file.size, recordCount),
        pricingReasoning: `JSON format pricing for ${recordCount} records with ${keys.length} fields.`,
        sensitivityScore: calculateSensitivityScore(keys, fileContent),
        keyInsights: [`${recordCount} JSON records`, `${keys.length} data fields`, "API-ready format"],
        recordCount: recordCount,
        columnCount: keys.length,
        dataTypes: detectDataTypes(keys),
      }
    } catch (parseError) {
      return {
        summary: "File appears to be JSON format but requires validation. May contain valuable unstructured data.",
        categories: ["general"],
        dataQuality: "Needs review - JSON parsing failed",
        useCases: ["Manual analysis", "Data cleaning", "Format conversion"],
        suggestedPriceETH: "0.001",
        pricingReasoning: "Base price for files requiring manual processing",
        sensitivityScore: 3,
        keyInsights: ["File format needs validation", "May contain valuable data"],
        recordCount: 0,
        columnCount: 0,
        dataTypes: ["mixed"],
      }
    }
  } else {
    return {
      summary: `${file.type} file containing ${fileSizeKB}KB of data. Suitable for specialized analysis and processing.`,
      categories: ["general"],
      dataQuality: "Unknown - requires specialized analysis",
      useCases: ["Specialized analysis", "Format-specific processing", "Research"],
      suggestedPriceETH: calculateBasicPrice(file.size, 0),
      pricingReasoning: `Pricing based on file size (${fileSizeKB}KB) and specialized format.`,
      sensitivityScore: 3,
      keyInsights: ["Specialized file format", "May require custom processing"],
      recordCount: 0,
      columnCount: 0,
      dataTypes: ["mixed"],
    }
  }
}

function detectBasicCategories(headers: string[], content: string): string[] {
  const categories = new Set<string>()
  const lowerContent = content.toLowerCase()
  const lowerHeaders = headers.map((h) => h.toLowerCase())

  // Health-related keywords
  if (
    lowerHeaders.some(
      (h) =>
        h.includes("health") ||
        h.includes("medical") ||
        h.includes("fitness") ||
        h.includes("heart") ||
        h.includes("blood") ||
        h.includes("patient") ||
        h.includes("diagnosis"),
    ) ||
    lowerContent.includes("health") ||
    lowerContent.includes("medical")
  ) {
    categories.add("health")
  }

  // Financial keywords
  if (
    lowerHeaders.some(
      (h) =>
        h.includes("price") ||
        h.includes("cost") ||
        h.includes("payment") ||
        h.includes("transaction") ||
        h.includes("money") ||
        h.includes("revenue") ||
        h.includes("profit"),
    ) ||
    lowerContent.includes("payment") ||
    lowerContent.includes("transaction")
  ) {
    categories.add("financial")
  }

  // Location keywords
  if (
    lowerHeaders.some(
      (h) =>
        h.includes("location") ||
        h.includes("address") ||
        h.includes("city") ||
        h.includes("country") ||
        h.includes("lat") ||
        h.includes("lng") ||
        h.includes("coordinates"),
    ) ||
    lowerContent.includes("location") ||
    lowerContent.includes("address")
  ) {
    categories.add("location")
  }

  // E-commerce keywords
  if (
    lowerHeaders.some(
      (h) =>
        h.includes("product") ||
        h.includes("purchase") ||
        h.includes("order") ||
        h.includes("cart") ||
        h.includes("item") ||
        h.includes("customer"),
    ) ||
    lowerContent.includes("purchase") ||
    lowerContent.includes("product")
  ) {
    categories.add("ecommerce")
  }

  // Social media keywords
  if (
    lowerHeaders.some(
      (h) =>
        h.includes("social") ||
        h.includes("friend") ||
        h.includes("message") ||
        h.includes("post") ||
        h.includes("comment") ||
        h.includes("like") ||
        h.includes("share"),
    ) ||
    lowerContent.includes("social") ||
    lowerContent.includes("message")
  ) {
    categories.add("social")
  }

  // Technology/Web keywords
  if (
    lowerHeaders.some(
      (h) =>
        h.includes("url") ||
        h.includes("website") ||
        h.includes("browser") ||
        h.includes("search") ||
        h.includes("visit") ||
        h.includes("click") ||
        h.includes("session"),
    ) ||
    lowerContent.includes("http") ||
    lowerContent.includes("www")
  ) {
    categories.add("technology")
  }

  return categories.size > 0 ? Array.from(categories) : ["general"]
}

function detectDataTypes(headers: string[]): string[] {
  const types = new Set<string>()

  headers.forEach((header) => {
    const lower = header.toLowerCase()
    if (lower.includes("date") || lower.includes("time") || lower.includes("timestamp")) types.add("temporal")
    if (lower.includes("id") || lower.includes("number") || lower.includes("count")) types.add("identifier")
    if (lower.includes("name") || lower.includes("title") || lower.includes("description")) types.add("textual")
    if (lower.includes("amount") || lower.includes("price") || lower.includes("cost") || lower.includes("value"))
      types.add("numerical")
    if (lower.includes("email") || lower.includes("phone") || lower.includes("contact")) types.add("contact")
    if (lower.includes("lat") || lower.includes("lng") || lower.includes("coordinate")) types.add("geospatial")
  })

  return types.size > 0 ? Array.from(types) : ["mixed"]
}

function calculateBasicPrice(fileSize: number, recordCount: number): string {
  const sizeInMB = fileSize / (1024 * 1024)
  let basePrice = 0.001 // Base price in ETH

  // Size-based pricing
  if (sizeInMB > 10) basePrice += 0.002
  if (sizeInMB > 50) basePrice += 0.005
  if (sizeInMB > 100) basePrice += 0.01

  // Record count-based pricing
  if (recordCount > 1000) basePrice += 0.001
  if (recordCount > 10000) basePrice += 0.003
  if (recordCount > 100000) basePrice += 0.007

  return Math.min(basePrice, 0.05).toFixed(4) // Cap at 0.05 ETH
}

function calculateSensitivityScore(headers: string[], content: string): number {
  let score = 1
  const sensitiveKeywords = [
    "email",
    "phone",
    "address",
    "ssn",
    "credit",
    "password",
    "personal",
    "private",
    "medical",
    "health",
    "financial",
    "bank",
    "account",
    "social security",
    "passport",
    "license",
  ]
  const lowerContent = content.toLowerCase()
  const lowerHeaders = headers.map((h) => h.toLowerCase())

  sensitiveKeywords.forEach((keyword) => {
    if (lowerHeaders.some((h) => h.includes(keyword)) || lowerContent.includes(keyword)) {
      score += 0.5
    }
  })

  return Math.min(Math.round(score), 5)
}
