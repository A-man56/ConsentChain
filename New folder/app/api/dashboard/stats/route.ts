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
        console.log("Fetching stats for user:", userId)
      } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
    } else {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    try {
      const { db } = await connectToDatabase()

      // Get user's datasets
      const datasets = await db.collection("datasets").find({ userId }).toArray()

      // Get user's purchases
      const purchases = await db.collection("purchases").find({ buyerId: userId }).toArray()

      // Calculate stats
      const totalDatasets = datasets.length
      const totalEarnings = datasets.reduce((sum, dataset) => sum + (Number(dataset.earnings) || 0), 0)
      const totalPurchases = purchases.length
      const activeListings = datasets.filter((d) => d.status === "active").length

      // Generate mock monthly earnings data
      const monthlyEarnings = [
        { month: "Jan", earnings: 0.5 },
        { month: "Feb", earnings: 0.8 },
        { month: "Mar", earnings: 1.2 },
        { month: "Apr", earnings: 0.9 },
        { month: "May", earnings: 1.5 },
        { month: "Jun", earnings: totalEarnings },
      ]

      // Generate category breakdown
      const categoryCount: { [key: string]: number } = {}
      datasets.forEach((dataset) => {
        if (dataset.categories && Array.isArray(dataset.categories)) {
          dataset.categories.forEach((category: string) => {
            categoryCount[category] = (categoryCount[category] || 0) + 1
          })
        }
      })

      const categoryBreakdown = Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      }))

      const stats = {
        totalDatasets,
        totalEarnings,
        totalPurchases,
        activeListings,
        monthlyEarnings,
        categoryBreakdown,
      }

      console.log("Stats calculated:", stats)
      return NextResponse.json(stats)
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Return default stats if database fails
      return NextResponse.json({
        totalDatasets: 0,
        totalEarnings: 0,
        totalPurchases: 0,
        activeListings: 0,
        monthlyEarnings: [],
        categoryBreakdown: [],
      })
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
