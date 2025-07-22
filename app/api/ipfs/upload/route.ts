import { type NextRequest, NextResponse } from "next/server"
import { NFTStorage, File } from "nft.storage"

const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN! })

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("Uploading file to IPFS:", file.name)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create NFT.Storage file
    const nftFile = new File([buffer], file.name, { type: file.type })

    // Upload to IPFS
    const cid = await client.storeBlob(nftFile)

    console.log("File uploaded to IPFS with CID:", cid)

    return NextResponse.json({
      success: true,
      cid,
      url: `https://nftstorage.link/ipfs/${cid}`,
      gateway: `https://${cid}.ipfs.nftstorage.link`,
    })
  } catch (error) {
    console.error("IPFS upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to upload to IPFS",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
