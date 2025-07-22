import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { type User, type SignupData, sanitizeUser } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received signup data:", body)

    const { firstName, lastName, email, password, confirmPassword }: SignupData = body

    // Validation
    if (!firstName || !lastName || !email || !password) {
      console.log("Missing required fields")
      return NextResponse.json(
        {
          error: "All fields are required",
          details: { firstName: !!firstName, lastName: !!lastName, email: !!email, password: !!password },
        },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      console.log("Password too short")
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      console.log("Passwords do not match")
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
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

    // Check if user already exists
    console.log("Checking for existing user...")
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      console.log("User already exists")
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    console.log("Hashing password...")
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    console.log("Creating new user...")
    const newUser: Omit<User, "_id"> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      nftsCreated: 0,
      totalEarnings: 0,
    }

    const result = await usersCollection.insertOne(newUser)
    console.log("User created with ID:", result.insertedId)

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key"
    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
      jwtSecret,
      { expiresIn: "7d" },
    )

    // Create user response
    const userWithId: User = { ...newUser, _id: result.insertedId }
    const userResponse = sanitizeUser(userWithId)

    console.log("Signup successful for:", email)
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: userResponse,
        token,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      {
        error: "Internal server error during signup",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
