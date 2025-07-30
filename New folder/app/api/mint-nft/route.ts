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

    // Parse the request body as FormData
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const categoriesString = formData.get("categories") as string
    const priceString = formData.get("price") as string
    const accessDurationString = formData.get("accessDuration") as string
    const analysisString = formData.get("analysis") as string

    // Parse JSON strings
    let parsedCategories: string[] = []
    try {
      parsedCategories = JSON.parse(categoriesString)
    } catch (e) {
      console.error("Failed to parse categories:", e)
      return NextResponse.json({ error: "Invalid categories format" }, { status: 400 })
    }

    let parsedAnalysis: any = {}
    try {
      parsedAnalysis = JSON.parse(analysisString)
    } catch (e) {
      console.error("Failed to parse analysis:", e)
      return NextResponse.json({ error: "Invalid analysis format" }, { status: 400 })
    }

    console.log("Mint NFT request data:", {
      title,
      description,
      parsedCategories,
      priceString,
      accessDurationString,
      parsedAnalysis,
      fileName: file?.name,
    })

    // Validation
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const price = Number.parseFloat(priceString)
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "Valid price required" }, { status: 400 })
    }

    if (!parsedCategories || !Array.isArray(parsedCategories) || parsedCategories.length === 0) {
      return NextResponse.json({ error: "At least one category must be selected" }, { status: 400 })
    }

    try {
      const { db } = await connectToDatabase()

      // Generate token ID
      const tokenId = Math.floor(Math.random() * 1000000) + 1000

      // Create dataset record
      const dataset = {
        userId,
        tokenId,
        title: title || file.name || "Untitled Dataset",
        description:
          description ||
          parsedAnalysis.summary ||
          `Dataset containing ${parsedAnalysis.fileCount || 1} file(s) with categories: ${parsedCategories.join(", ")}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        categories: parsedCategories,
        price: price,
        currency: "ETH", // Hardcoded as per client, or could be passed from client
        accessDuration: accessDurationString === "unlimited" ? -1 : Number.parseInt(accessDurationString) || 30,
        allowRevocation: false, // Not passed from client, assume default
        analysis: parsedAnalysis,
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
