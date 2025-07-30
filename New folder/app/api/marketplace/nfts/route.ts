import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    let currentUserId = null

    // Try to get current user ID from token (optional for marketplace)
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key") as any
        currentUserId = decoded.userId
      } catch (error) {
        // Token invalid, but that's okay for marketplace viewing
        console.log("Invalid token, showing public marketplace")
      }
    }

    try {
      const { db } = await connectToDatabase()

      // Get all active datasets, excluding current user's datasets if logged in
      const query = currentUserId ? { status: "active", userId: { $ne: currentUserId } } : { status: "active" }

      const allDatasets = await db.collection("datasets").find(query).toArray()

      // Get user info for seller names
      const userIds = [...new Set(allDatasets.map((dataset) => dataset.userId))]
      const users = await db
        .collection("users")
        .find({ _id: { $in: userIds } })
        .toArray()
      const userMap = users.reduce(
        (acc, user) => {
          acc[user._id.toString()] = `${user.firstName} ${user.lastName}`
          return acc
        },
        {} as Record<string, string>,
      )

      // Transform to expected format
      const datasets = allDatasets.map((dataset) => ({
        id: dataset._id.toString(),
        title: dataset.title || dataset.fileName || "Untitled Dataset",
        description: dataset.description || dataset.analysis?.summary || "No description available",
        categories: Array.isArray(dataset.categories) ? dataset.categories : ["general"],
        price: Number(dataset.price) || 0,
        currency: dataset.currency || "ETH",
        createdAt: dataset.createdAt || new Date().toISOString(),
        views: Number(dataset.views) || 0,
        purchases: Number(dataset.totalSales) || 0,
        seller: dataset.userId,
        sellerName: userMap[dataset.userId] || "Unknown Seller",
        fileName: dataset.fileName || "Unknown File",
        fileSize: Number(dataset.fileSize) || 0,
        accessDuration: Number(dataset.accessDuration) || 30,
        status: dataset.status || "active",
      }))

      console.log(`Found ${datasets.length} marketplace datasets`)
      return NextResponse.json({ datasets })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ datasets: [] })
    }
  } catch (error) {
    console.error("Error fetching marketplace data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch marketplace data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
