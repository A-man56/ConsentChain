import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Purchase request:", body)

    // Get user from token
    const authHeader = request.headers.get("authorization")
    let userId = null

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key") as any
        userId = decoded.userId
      } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
    } else {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    const { tokenId, price, sellerId } = body

    if (!tokenId || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      const { db } = await connectToDatabase()

      // Get dataset info
      const dataset = await db.collection("datasets").findOne({ tokenId: Number(tokenId) })
      if (!dataset) {
        return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
      }

      // Create purchase record
      const purchase = {
        buyerId: userId,
        sellerId: sellerId || dataset.userId,
        tokenId: Number(tokenId),
        title: dataset.title,
        price: Number(price),
        currency: "ETH",
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        purchaseDate: new Date(),
        expiryDate: new Date(Date.now() + (dataset.accessDuration || 30) * 24 * 60 * 60 * 1000),
        status: "active",
        downloadUrl: `/api/download/${tokenId}`,
        createdAt: new Date(),
      }

      const result = await db.collection("purchases").insertOne(purchase)

      // Update dataset sales count and earnings
      await db.collection("datasets").updateOne(
        { tokenId: Number(tokenId) },
        {
          $inc: {
            totalSales: 1,
            earnings: Number(price),
          },
        },
      )

      console.log("Purchase saved:", result.insertedId)

      return NextResponse.json({
        success: true,
        message: "Purchase completed successfully!",
        data: {
          purchaseId: result.insertedId.toString(),
          transactionHash: purchase.transactionHash,
          downloadUrl: purchase.downloadUrl,
          expiryDate: purchase.expiryDate,
        },
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          error: "Failed to process purchase",
          details: dbError instanceof Error ? dbError.message : "Database error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json(
      {
        error: "Failed to process purchase",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
