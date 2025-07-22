import { NextResponse } from "next/server"

// Smart contract information and ABI
const CONTRACT_INFO = {
  networks: {
    mumbai: {
      name: "Polygon Mumbai Testnet",
      chainId: 80001,
      rpcUrl: "https://rpc-mumbai.maticvigil.com/",
      contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
      explorerUrl: "https://mumbai.polygonscan.com/",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
    },
    polygon: {
      name: "Polygon Mainnet",
      chainId: 137,
      rpcUrl: "https://polygon-rpc.com/",
      contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
      explorerUrl: "https://polygonscan.com/",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
    },
  },
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "string",
          name: "tokenURI",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "duration",
          type: "uint256",
        },
        {
          internalType: "string[]",
          name: "categories",
          type: "string[]",
        },
      ],
      name: "mintDataNFT",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "tokenURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "dataNFTs",
      outputs: [
        {
          internalType: "string",
          name: "metadataURI",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "duration",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "creator",
          type: "address",
        },
        {
          internalType: "bool",
          name: "isActive",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "getDataNFT",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "metadataURI",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "price",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "duration",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "creator",
              type: "address",
            },
            {
              internalType: "bool",
              name: "isActive",
              type: "bool",
            },
          ],
          internalType: "struct ConsentChainNFT.DataNFT",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "duration",
          type: "uint256",
        },
      ],
      name: "purchaseDataAccess",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "hasAccess",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "creator",
          type: "address",
        },
      ],
      name: "getCreatorNFTs",
      outputs: [
        {
          internalType: "uint256[]",
          name: "",
          type: "uint256[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllActiveNFTs",
      outputs: [
        {
          internalType: "uint256[]",
          name: "",
          type: "uint256[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "creator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "metadataURI",
          type: "string",
        },
      ],
      name: "DataNFTMinted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "buyer",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "duration",
          type: "uint256",
        },
      ],
      name: "DataAccessPurchased",
      type: "event",
    },
  ],
  gasEstimates: {
    mintDataNFT: "150000",
    purchaseDataAccess: "80000",
    getDataNFT: "30000",
    hasAccess: "25000",
    transfer: "21000",
    approve: "50000",
  },
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      contracts: CONTRACT_INFO,
      supportedNetworks: ["mumbai", "polygon"],
      defaultNetwork: "mumbai",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Contract info error:", error)
    return NextResponse.json(
      {
        error: "Failed to get contract information",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { network, action, params } = await request.json()

    if (!CONTRACT_INFO.networks[network as keyof typeof CONTRACT_INFO.networks]) {
      return NextResponse.json({ error: "Unsupported network" }, { status: 400 })
    }

    const networkInfo = CONTRACT_INFO.networks[network as keyof typeof CONTRACT_INFO.networks]

    // Simulate gas estimation
    const gasEstimate = CONTRACT_INFO.gasEstimates[action as keyof typeof CONTRACT_INFO.gasEstimates] || "100000"

    return NextResponse.json({
      success: true,
      network: networkInfo,
      gasEstimate,
      contractAddress: networkInfo.contractAddress,
      abi: CONTRACT_INFO.abi,
      params,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Contract interaction error:", error)
    return NextResponse.json(
      {
        error: "Failed to process contract interaction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
