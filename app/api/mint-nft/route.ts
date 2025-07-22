import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"

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
        console.log("Minting NFT for user:", userId)
      } catch (error) {
        console.error("Token verification error:", error)
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
    } else {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    console.log("Mint NFT request body:", body)

    const { files, categories, pricing } = body

    // Validation
    if (!files || !files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (!pricing || !pricing.price) {
      return NextResponse.json({ error: "Pricing information required" }, { status: 400 })
    }

    if (!categories || !categories.some((cat: any) => cat.selected)) {
      return NextResponse.json({ error: "At least one category must be selected" }, { status: 400 })
    }

    try {
      const { db } = await connectToDatabase()

      // Get the first file for main dataset info
      const mainFile = files[0]
      const selectedCategories = categories.filter((cat: any) => cat.selected).map((cat: any) => cat.name)

      // Generate token ID
      const tokenId = Math.floor(Math.random() * 1000000) + 1000

      // Create dataset record
      const dataset = {
        userId,
        tokenId,
        title: mainFile.file?.name || mainFile.name || "Untitled Dataset",
        description: `Dataset containing ${files.length} file(s) with categories: ${selectedCategories.join(", ")}`,
        fileName: mainFile.file?.name || mainFile.name,
        fileSize: mainFile.file?.size || 0,
        fileType: mainFile.file?.type || "unknown",
        categories: selectedCategories,
        price: Number.parseFloat(pricing.price),
        currency: pricing.currency || "ETH",
        accessDuration: Number.parseInt(pricing.duration) || 30,
        allowRevocation: pricing.allowRevocation || false,
        analysis: {
          summary: mainFile.summary || "Analysis completed",
          categories: mainFile.categories || [],
          fileCount: files.length,
        },
        status: "active",
        totalSales: 0,
        earnings: 0,
        views: 0,
        purchases: 0,
        ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}`, // Simulated IPFS hash
        metadataHash: `Qm${Math.random().toString(36).substring(2, 15)}`, // Simulated metadata hash
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      console.log("Saving dataset:", dataset)

      const result = await db.collection("datasets").insertOne(dataset)
      console.log("Dataset saved with ID:", result.insertedId)

      // Simulate blockchain transaction
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`
      const blockNumber = Math.floor(Math.random() * 1000000)

      return NextResponse.json({
        success: true,
        message: "NFT minted successfully!",
        tokenId: dataset.tokenId,
        transactionHash,
        blockNumber,
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
        datasetId: result.insertedId.toString(),
        ipfsHash: dataset.ipfsHash,
        metadataHash: dataset.metadataHash,
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          error: "Failed to save dataset to database",
          details: dbError instanceof Error ? dbError.message : "Database error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Mint NFT error:", error)
    return NextResponse.json(
      {
        error: "Failed to mint NFT",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
