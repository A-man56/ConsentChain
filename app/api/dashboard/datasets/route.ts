import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const authHeader = request.headers.get("authorization")
    let userId = null

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key") as any
        userId = decoded.userId
        console.log("Fetching datasets for user:", userId)
      } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
    } else {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    try {
      const { db } = await connectToDatabase()

      // Get user's uploaded datasets from database
      const userDatasets = await db.collection("datasets").find({ userId }).toArray()

      // Transform to expected format
      const datasets = userDatasets.map((dataset) => ({
        id: dataset._id.toString(),
        tokenId: dataset.tokenId || Math.floor(Math.random() * 10000),
        title: dataset.title || dataset.fileName || "Untitled Dataset",
        categories: dataset.categories || [],
        price: dataset.price || 0,
        currency: dataset.currency || "ETH",
        status: dataset.status || "active",
        totalSales: dataset.totalSales || 0,
        earnings: dataset.earnings || 0,
        createdAt: dataset.createdAt || new Date().toISOString(),
        accessDuration: dataset.accessDuration || 30,
        description: dataset.description || dataset.analysis?.summary || "No description available",
        fileSize: dataset.fileSize || 0,
        fileType: dataset.fileType || "unknown",
      }))

      console.log(`Found ${datasets.length} datasets for user ${userId}`)
      return NextResponse.json({ datasets })
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Return empty array if database fails
      return NextResponse.json({ datasets: [] })
    }
  } catch (error) {
    console.error("Error fetching user datasets:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch datasets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
