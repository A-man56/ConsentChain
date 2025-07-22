import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Get all datasets that are available for sale (status: active)
    const datasets = await db
      .collection("datasets")
      .find({
        status: { $in: ["active", "minted"] },
        price: { $gt: 0 }, // Only show datasets with a price > 0
      })
      .toArray()

    // Transform to marketplace format
    const marketplaceDatasets = datasets.map((dataset) => ({
      id: dataset._id.toString(),
      title: dataset.title || dataset.fileName || "Untitled Dataset",
      description: dataset.description || dataset.analysis?.summary || "No description available",
      categories: dataset.categories || [],
      price: dataset.price || 0,
      currency: dataset.currency || "ETH",
      createdAt: dataset.createdAt || new Date().toISOString(),
      views: dataset.views || 0,
      purchases: dataset.purchases || 0,
      seller: dataset.userId,
      sellerName: dataset.userName || dataset.userEmail?.split("@")[0] || "Anonymous",
      fileName: dataset.fileName || "unknown",
      fileSize: dataset.fileSize || 0,
      accessDuration: dataset.accessDuration || 30,
      tokenId: dataset.tokenId,
      contractAddress: dataset.contractAddress,
    }))

    console.log(`Found ${marketplaceDatasets.length} datasets for marketplace`)

    return NextResponse.json({
      datasets: marketplaceDatasets,
      total: marketplaceDatasets.length,
    })
  } catch (error) {
    console.error("Error fetching marketplace data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch marketplace data",
        datasets: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}
