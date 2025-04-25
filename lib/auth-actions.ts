"use server"

import { cookies } from "next/headers"
import * as crypto from "crypto"
import { getSecureStorage, setSecureStorage } from "@/lib/secure-storage"

// Register a new user
export async function registerUser(username: string, passkey: string) {
  try {
    const storage = getSecureStorage()

    // Check if username already exists
    if (storage.users && storage.users[username]) {
      return { success: false, error: "Username already exists" }
    }

    // Generate a salt
    const salt = crypto.randomBytes(16).toString("hex")

    // Hash the passkey with the salt
    const passkeyHash = crypto
      .createHash("sha256")
      .update(passkey + salt)
      .digest("hex")

    // Initialize user's storage
    if (!storage.users) {
      storage.users = {}
    }

    storage.users[username] = {
      salt,
      passkeyHash,
      data: {},
      loginAttempts: 0,
    }

    // Save the updated storage
    setSecureStorage(storage)

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Failed to register user" }
  }
}

// Login a user
export async function loginUser(username: string, passkey: string) {
  try {
    const storage = getSecureStorage()

    // Check if username exists
    if (!storage.users || !storage.users[username]) {
      return { success: false, error: "Invalid username or passkey" }
    }

    const user = storage.users[username]

    // Check if account is locked
    if (user.loginAttempts >= 3) {
      return { success: false, error: "Account locked due to too many failed attempts" }
    }

    // Verify passkey
    const passkeyHash = crypto
      .createHash("sha256")
      .update(passkey + user.salt)
      .digest("hex")

    if (passkeyHash !== user.passkeyHash) {
      // Increment failed attempts
      user.loginAttempts += 1
      setSecureStorage(storage)

      return {
        success: false,
        error: `Invalid username or passkey. ${3 - user.loginAttempts} attempts remaining.`,
      }
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0
    setSecureStorage(storage)

    // Set session cookie
    const sessionId = crypto.randomBytes(32).toString("hex")
    cookies().set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    // Store session in storage
    if (!storage.sessions) {
      storage.sessions = {}
    }

    storage.sessions[sessionId] = {
      username,
      createdAt: Date.now(),
    }

    setSecureStorage(storage)

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Failed to login" }
  }
}

// Logout a user
export async function logoutUser() {
  try {
    const sessionId = cookies().get("session")?.value

    if (sessionId) {
      // Remove session from storage
      const storage = getSecureStorage()

      if (storage.sessions && storage.sessions[sessionId]) {
        delete storage.sessions[sessionId]
        setSecureStorage(storage)
      }

      // Delete session cookie
      cookies().delete("session")
    }

    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: "Failed to logout" }
  }
}

// Get current user data
export async function getUserData() {
  try {
    const sessionId = cookies().get("session")?.value

    if (!sessionId) {
      return null
    }

    const storage = getSecureStorage()

    if (!storage.sessions || !storage.sessions[sessionId]) {
      return null
    }

    const { username } = storage.sessions[sessionId]

    if (!storage.users || !storage.users[username]) {
      return null
    }

    return { username }
  } catch (error) {
    console.error("Get user data error:", error)
    return null
  }
}
