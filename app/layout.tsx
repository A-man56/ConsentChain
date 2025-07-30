import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ConsentChain - Decentralized Data Marketplace",
  description: "A blockchain-based platform for secure data sharing and monetization with user consent management",
  keywords: ["blockchain", "data marketplace", "consent management", "NFT", "decentralized"],
  authors: [{ name: "ConsentChain Team" }],
  creator: "ConsentChain",
  publisher: "ConsentChain",
  robots: "index, follow",
  openGraph: {
    title: "ConsentChain - Decentralized Data Marketplace",
    description: "A blockchain-based platform for secure data sharing and monetization with user consent management",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConsentChain - Decentralized Data Marketplace",
    description: "A blockchain-based platform for secure data sharing and monetization with user consent management",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
