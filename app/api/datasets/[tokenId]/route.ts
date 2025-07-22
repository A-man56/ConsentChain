import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { tokenId: string } }) {
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

    const { db } = await connectToDatabase()
    const datasetId = params.tokenId

    // Check if dataset exists and belongs to user
    const dataset = await db.collection("datasets").findOne({
      _id: new ObjectId(datasetId),
      userId: userId,
    })

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found or unauthorized" }, { status: 404 })
    }

    // Delete the dataset
    await db.collection("datasets").deleteOne({
      _id: new ObjectId(datasetId),
      userId: userId,
    })

    return NextResponse.json({ message: "Dataset deleted successfully" })
  } catch (error) {
    console.error("Error deleting dataset:", error)
    return NextResponse.json({ error: "Failed to delete dataset" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { tokenId: string } }) {
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

    const { db } = await connectToDatabase()
    const datasetId = params.tokenId
    const updateData = await request.json()

    // Check if dataset exists and belongs to user
    const dataset = await db.collection("datasets").findOne({
      _id: new ObjectId(datasetId),
      userId: userId,
    })

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found or unauthorized" }, { status: 404 })
    }

    // Update the dataset
    await db.collection("datasets").updateOne(
      { _id: new ObjectId(datasetId), userId: userId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    return NextResponse.json({ message: "Dataset updated successfully" })
  } catch (error) {
    console.error("Error updating dataset:", error)
    return NextResponse.json({ error: "Failed to update dataset" }, { status: 500 })
  }
}
