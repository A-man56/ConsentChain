import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  firstName: string
  lastName: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
  isVerified?: boolean
  nftsCreated?: number
  totalEarnings?: number
}

export interface UserResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: Date
  isVerified: boolean
  nftsCreated: number
  totalEarnings: number
}

export interface SignupData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginData {
  email: string
  password: string
}

export function sanitizeUser(user: User): UserResponse {
  return {
    id: user._id?.toString() || "",
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
    isVerified: user.isVerified || false,
    nftsCreated: user.nftsCreated || 0,
    totalEarnings: user.totalEarnings || 0,
  }
}
