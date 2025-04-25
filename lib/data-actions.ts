"use server"

import * as crypto from "crypto"
import { cookies } from "next/headers"
import { getSecureStorage, setSecureStorage } from "@/lib/secure-storage"

// Helper function to get current user
async function getCurrentUser() {
  try {
    const sessionId = cookies().get("session")?.value

    if (!sessionId) {
      return null
    }

    const storage = getSecureStorage()

    if (!storage.sessions || !storage.sessions[sessionId]) {
      return null
    }

    return storage.sessions[sessionId].username
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Helper function to generate encryption key from passkey
function generateKeyFromPasskey(passkey: string, salt: string) {
  // Use PBKDF2 to derive a key from the passkey
  return crypto.pbkdf2Sync(
    passkey,
    salt,
    100000, // iterations
    32, // key length
    "sha256",
  )
}

// Store data
export async function storeData(dataKey: string, dataValue: string, passkey: string) {
  try {
    const username = getCurrentUser()

    if (!username) {
      return { success: false, error: "You must be logged in to store data" }
    }

    const storage = getSecureStorage()

    if (!storage.users || !storage.users[username]) {
      return { success: false, error: "User not found" }
    }

    const user = storage.users[username]

    // Verify passkey
    const passkeyHash = crypto
      .createHash("sha256")
      .update(passkey + user.salt)
      .digest("hex")

    if (passkeyHash !== user.passkeyHash) {
      return { success: false, error: "Invalid passkey" }
    }

    // Generate encryption key from passkey
    const key = generateKeyFromPasskey(passkey, user.salt)

    // Create initialization vector
    const iv = crypto.randomBytes(16)

    // Create cipher
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)

    // Encrypt the data
    let encrypted = cipher.update(dataValue, "utf8", "hex")
    encrypted += cipher.final("hex")

    // Store the encrypted data
    if (!user.data) {
      user.data = {}
    }

    user.data[dataKey] = {
      iv: iv.toString("hex"),
      encryptedData: encrypted,
    }

    // Save the updated storage
    setSecureStorage(storage)

    return { success: true }
  } catch (error) {
    console.error("Store data error:", error)
    return { success: false, error: "Failed to store data" }
  }
}

// Retrieve data
export async function retrieveData(dataKey: string, passkey: string) {
  try {
    const username = getCurrentUser()

    if (!username) {
      return { success: false, error: "You must be logged in to retrieve data" }
    }

    const storage = getSecureStorage()

    if (!storage.users || !storage.users[username]) {
      return { success: false, error: "User not found" }
    }

    const user = storage.users[username]

    if (!user.data || !user.data[dataKey]) {
      return { success: false, error: "Data not found" }
    }

    // Verify passkey
    const passkeyHash = crypto
      .createHash("sha256")
      .update(passkey + user.salt)
      .digest("hex")

    if (passkeyHash !== user.passkeyHash) {
      return { success: false, error: "Invalid passkey" }
    }

    // Generate decryption key from passkey
    const key = generateKeyFromPasskey(passkey, user.salt)

    // Get the encrypted data and iv
    const { iv, encryptedData } = user.data[dataKey]

    // Create decipher
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(iv, "hex"))

    // Decrypt the data
    let decrypted = decipher.update(encryptedData, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return { success: true, data: decrypted }
  } catch (error) {
    console.error("Retrieve data error:", error)
    return { success: false, error: "Failed to retrieve data" }
  }
}

// Get data keys
export async function getDataKeys() {
  try {
    const username = getCurrentUser()

    if (!username) {
      return []
    }

    const storage = getSecureStorage()

    if (!storage.users || !storage.users[username] || !storage.users[username].data) {
      return []
    }

    return Object.keys(storage.users[username].data)
  } catch (error) {
    console.error("Get data keys error:", error)
    return []
  }
}

// Export data
export async function exportData(passkey: string) {
  try {
    const username = getCurrentUser()

    if (!username) {
      return { success: false, error: "You must be logged in to export data" }
    }

    const storage = getSecureStorage()

    if (!storage.users || !storage.users[username]) {
      return { success: false, error: "User not found" }
    }

    const user = storage.users[username]

    // Verify passkey
    const passkeyHash = crypto
      .createHash("sha256")
      .update(passkey + user.salt)
      .digest("hex")

    if (passkeyHash !== user.passkeyHash) {
      return { success: false, error: "Invalid passkey" }
    }

    // Check if user has data
    if (!user.data || Object.keys(user.data).length === 0) {
      return { success: false, error: "No data to export" }
    }

    // Create export object
    const exportObject = {
      version: "1.0",
      salt: user.salt,
      data: user.data,
    }

    // Encrypt the entire export object with the passkey
    const exportKey = generateKeyFromPasskey(passkey, user.salt)
    const exportIv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv("aes-256-cbc", exportKey, exportIv)
    let encryptedExport = cipher.update(JSON.stringify(exportObject), "utf8", "hex")
    encryptedExport += cipher.final("hex")

    // Create final export file content
    const exportData = JSON.stringify({
      format: "secure-vault-export",
      iv: exportIv.toString("hex"),
      encryptedData: encryptedExport,
    })

    return { success: true, data: exportData }
  } catch (error) {
    console.error("Export data error:", error)
    return { success: false, error: "Failed to export data" }
  }
}

// Import data
export async function importData(fileContent: string, passkey: string) {
  try {
    const username = getCurrentUser()

    if (!username) {
      return { success: false, error: "You must be logged in to import data" }
    }

    const storage = getSecureStorage()

    if (!storage.users || !storage.users[username]) {
      return { success: false, error: "User not found" }
    }

    const user = storage.users[username]

    // Verify passkey
    const passkeyHash = crypto
      .createHash("sha256")
      .update(passkey + user.salt)
      .digest("hex")

    if (passkeyHash !== user.passkeyHash) {
      return { success: false, error: "Invalid passkey" }
    }

    // Parse the import file
    const importFile = JSON.parse(fileContent)

    if (importFile.format !== "secure-vault-export" || !importFile.iv || !importFile.encryptedData) {
      return { success: false, error: "Invalid import file format" }
    }

    // Decrypt the import data
    const importKey = generateKeyFromPasskey(passkey, user.salt)

    const decipher = crypto.createDecipheriv("aes-256-cbc", importKey, Buffer.from(importFile.iv, "hex"))

    let decryptedImport
    try {
      let decrypted = decipher.update(importFile.encryptedData, "hex", "utf8")
      decrypted += decipher.final("utf8")
      decryptedImport = JSON.parse(decrypted)
    } catch (error) {
      return { success: false, error: "Failed to decrypt import file. Incorrect passkey or corrupted file." }
    }

    // Validate the decrypted import
    if (!decryptedImport.version || !decryptedImport.data) {
      return { success: false, error: "Invalid import file structure" }
    }

    // Merge the imported data with existing data
    if (!user.data) {
      user.data = {}
    }

    const importedCount = Object.keys(decryptedImport.data).length

    // Merge data (overwrite existing keys)
    user.data = {
      ...user.data,
      ...decryptedImport.data,
    }

    // Save the updated storage
    setSecureStorage(storage)

    return { success: true, count: importedCount }
  } catch (error) {
    console.error("Import data error:", error)
    return { success: false, error: "Failed to import data" }
  }
}
