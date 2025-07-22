import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { type User, type LoginData, sanitizeUser } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received login data:", { email: body.email })

    const { email, password }: LoginData = body

    // Validation
    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("Invalid email format")
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Connect to database
    console.log("Connecting to database...")
    const { db } = await connectToDatabase()
    const usersCollection = db.collection<User>("users")

    // Find user
    console.log("Looking for user...")
    const user = await usersCollection.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.log("User not found")
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check password
    console.log("Verifying password...")
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log("Invalid password")
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key"
    const token = jwt.sign(
      {
        userId: user._id?.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      jwtSecret,
      { expiresIn: "7d" },
    )

    // Update last login
    await usersCollection.updateOne({ _id: user._id }, { $set: { updatedAt: new Date() } })

    const userResponse = sanitizeUser(user)

    console.log("Login successful for:", email)
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: userResponse,
        token,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error during login",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
