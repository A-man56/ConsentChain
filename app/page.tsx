"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Brain, Lock, Coins, ShoppingCart, Key, Users, TrendingUp } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import Link from "next/link"

export default function HomePage() {
  const [stats] = useState({
    totalDatasets: 1247,
    totalEarnings: 45.7,
    activeUsers: 892,
  })

  const features = [
    {
      icon: Cloud,
      title: "Upload Data",
      description: "Securely upload your personal data files (JSON, CSV)",
      color: "text-blue-500",
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "AI-powered summarization and categorization",
      color: "text-purple-500",
    },
    {
      icon: Lock,
      title: "Encryption",
      description: "End-to-end encryption with IPFS storage",
      color: "text-green-500",
    },
    {
      icon: Coins,
      title: "NFT Minting",
      description: "Mint your data as tradeable NFTs",
      color: "text-yellow-500",
    },
    {
      icon: ShoppingCart,
      title: "Marketplace",
      description: "Buy and sell data in a secure marketplace",
      color: "text-red-500",
    },
    {
      icon: Key,
      title: "Access Control",
      description: "Granular permissions and revocation rights",
      color: "text-indigo-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ConsentChain
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/marketplace" className="text-gray-600 hover:text-blue-600 transition-colors">
              Marketplace
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/upload" className="text-gray-600 hover:text-blue-600 transition-colors">
              Upload Data
            </Link>
          </nav>
          <UserMenu />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Your Data, Your Value
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your personal data into valuable NFTs with AI-powered insights. Sell securely on our blockchain
            marketplace while maintaining full control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              asChild
            >
              <Link href="/upload">Start Selling Data</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</h3>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalDatasets.toLocaleString()}</h3>
              <p className="text-gray-600">Datasets Listed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalEarnings} ETH</h3>
              <p className="text-gray-600">Total Earnings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">How ConsentChain Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4 ${feature.color}`}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-6">Ready to Monetize Your Data?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already earning from their personal data while maintaining complete privacy
            and control.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/signup">Create Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-xl font-bold">ConsentChain</h4>
              </div>
              <p className="text-gray-400">Empowering individuals to monetize their data securely on the blockchain.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Platform</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/marketplace" className="hover:text-white transition-colors">
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="/upload" className="hover:text-white transition-colors">
                    Upload Data
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/docs" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ConsentChain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
