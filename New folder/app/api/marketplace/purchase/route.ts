import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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
      } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
    } else {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    const { datasetId } = await request.json()

    if (!datasetId) {
      return NextResponse.json({ error: "Dataset ID is required" }, { status: 400 })
    }

    try {
      const { db } = await connectToDatabase()

      // Get the dataset
      const dataset = await db.collection("datasets").findOne({ _id: new ObjectId(datasetId) })

      if (!dataset) {
        return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
      }

      // Check if user is trying to buy their own dataset
      if (dataset.userId === userId) {
        return NextResponse.json({ error: "Cannot purchase your own dataset" }, { status: 400 })
      }

      // Check if user already purchased this dataset
      const existingPurchase = await db.collection("purchases").findOne({
        userId,
        datasetId: datasetId,
      })

      if (existingPurchase) {
        return NextResponse.json({ error: "You have already purchased this dataset" }, { status: 400 })
      }

      // Create purchase record
      const purchase = {
        userId,
        datasetId,
        datasetTitle: dataset.title || dataset.fileName || "Unknown Dataset",
        price: Number(dataset.price) || 0,
        purchaseDate: new Date().toISOString(),
        accessExpiry: new Date(Date.now() + (dataset.accessDuration || 30) * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        createdAt: new Date(),
      }

      const purchaseResult = await db.collection("purchases").insertOne(purchase)

      // Update dataset sales count and earnings
      await db.collection("datasets").updateOne(
        { _id: new ObjectId(datasetId) },
        {
          $inc: {
            totalSales: 1,
            earnings: Number(dataset.price) || 0,
            views: 1,
          },
        },
      )

      console.log("Purchase completed:", purchaseResult.insertedId)

      return NextResponse.json({
        success: true,
        message: "Purchase completed successfully!",
        purchaseId: purchaseResult.insertedId.toString(),
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          error: "Failed to complete purchase",
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
