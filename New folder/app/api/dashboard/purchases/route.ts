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
        console.log("Fetching purchases for user:", userId)
      } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
    } else {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    try {
      const { db } = await connectToDatabase()

      // Get user's purchases
      const userPurchases = await db.collection("purchases").find({ buyerId: userId }).toArray()

      // Transform to expected format
      const purchases = userPurchases.map((purchase) => ({
        _id: purchase._id.toString(),
        datasetTitle: purchase.datasetTitle || "Unknown Dataset",
        price: Number(purchase.price) || 0,
        purchaseDate: purchase.purchaseDate || new Date().toISOString(),
        accessExpiry: purchase.accessExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: purchase.status || "active",
      }))

      console.log(`Found ${purchases.length} purchases for user ${userId}`)
      return NextResponse.json(purchases)
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json([])
    }
  } catch (error) {
    console.error("Error fetching user purchases:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch purchases",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
