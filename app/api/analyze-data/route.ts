import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

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
      let analysis = {
        summary: "",
        categories: [] as string[],
        recordCount: 0,
        columns: [] as string[],
        dataTypes: [] as string[],
        sensitivityScore: 3,
      }

      // Basic file analysis based on file type and content
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        const lines = fileContent.split("\n").filter((line) => line.trim())
        const headers = lines[0] ? lines[0].split(",").map((h) => h.trim()) : []

        analysis = {
          summary: `CSV file containing ${lines.length - 1} records with ${headers.length} columns. Data appears to contain structured information suitable for analysis.`,
          categories: detectCategories(headers, fileContent),
          recordCount: Math.max(0, lines.length - 1),
          columns: headers,
          dataTypes: detectDataTypes(headers),
          sensitivityScore: calculateSensitivityScore(headers, fileContent),
        }
      } else if (file.type === "application/json" || file.name.endsWith(".json")) {
        try {
          const jsonData = JSON.parse(fileContent)
          const keys = Array.isArray(jsonData) && jsonData.length > 0 ? Object.keys(jsonData[0]) : Object.keys(jsonData)

          analysis = {
            summary: `JSON file containing ${Array.isArray(jsonData) ? jsonData.length : 1} record(s) with ${keys.length} fields. Structured data ready for processing.`,
            categories: detectCategories(keys, fileContent),
            recordCount: Array.isArray(jsonData) ? jsonData.length : 1,
            columns: keys,
            dataTypes: detectDataTypes(keys),
            sensitivityScore: calculateSensitivityScore(keys, fileContent),
          }
        } catch (parseError) {
          analysis.summary = "JSON file detected but structure could not be parsed. Manual review recommended."
        }
      } else {
        analysis = {
          summary: `File of type ${file.type} uploaded successfully. Contains ${Math.floor(file.size / 1024)}KB of data ready for processing.`,
          categories: ["general"],
          recordCount: Math.floor(file.size / 100), // Rough estimate
          columns: ["data"],
          dataTypes: ["mixed"],
          sensitivityScore: 3,
        }
      }

      console.log("Analysis completed:", analysis)

      return NextResponse.json({
        success: true,
        summary: analysis.summary,
        categories: analysis.categories,
        analysis: analysis,
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

function detectCategories(headers: string[], content: string): string[] {
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
        h.includes("blood"),
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
        h.includes("money"),
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
        h.includes("lng"),
    ) ||
    lowerContent.includes("location") ||
    lowerContent.includes("address")
  ) {
    categories.add("location")
  }

  // Shopping keywords
  if (
    lowerHeaders.some(
      (h) =>
        h.includes("product") ||
        h.includes("purchase") ||
        h.includes("order") ||
        h.includes("cart") ||
        h.includes("item"),
    ) ||
    lowerContent.includes("purchase") ||
    lowerContent.includes("product")
  ) {
    categories.add("shopping")
  }

  // Social keywords
  if (
    lowerHeaders.some(
      (h) =>
        h.includes("social") ||
        h.includes("friend") ||
        h.includes("message") ||
        h.includes("post") ||
        h.includes("comment"),
    ) ||
    lowerContent.includes("social") ||
    lowerContent.includes("message")
  ) {
    categories.add("social")
  }

  // Browsing keywords
  if (
    lowerHeaders.some(
      (h) =>
        h.includes("url") ||
        h.includes("website") ||
        h.includes("browser") ||
        h.includes("search") ||
        h.includes("visit"),
    ) ||
    lowerContent.includes("http") ||
    lowerContent.includes("www")
  ) {
    categories.add("browsing")
  }

  return categories.size > 0 ? Array.from(categories) : ["general"]
}

function detectDataTypes(headers: string[]): string[] {
  const types = new Set<string>()

  headers.forEach((header) => {
    const lower = header.toLowerCase()
    if (lower.includes("date") || lower.includes("time")) types.add("temporal")
    if (lower.includes("id") || lower.includes("number")) types.add("identifier")
    if (lower.includes("name") || lower.includes("title")) types.add("textual")
    if (lower.includes("amount") || lower.includes("price") || lower.includes("cost")) types.add("numerical")
    if (lower.includes("email") || lower.includes("phone")) types.add("contact")
  })

  return types.size > 0 ? Array.from(types) : ["mixed"]
}

function calculateSensitivityScore(headers: string[], content: string): number {
  let score = 1
  const sensitiveKeywords = ["email", "phone", "address", "ssn", "credit", "password", "personal", "private"]
  const lowerContent = content.toLowerCase()
  const lowerHeaders = headers.map((h) => h.toLowerCase())

  sensitiveKeywords.forEach((keyword) => {
    if (lowerHeaders.some((h) => h.includes(keyword)) || lowerContent.includes(keyword)) {
      score += 1
    }
  })

  return Math.min(score, 5)
}
