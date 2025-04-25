"use server"

// Define the storage structure
interface User {
  salt: string
  passkeyHash: string
  loginAttempts: number
  data: {
    [key: string]: {
      iv: string
      encryptedData: string
    }
  }
}

interface Session {
  username: string
  createdAt: number
}

interface SecureStorage {
  users: {
    [username: string]: User
  }
  sessions: {
    [sessionId: string]: Session
  }
}

// In-memory storage (for development)
// In a production environment, you might want to use a more persistent solution
let memoryStorage: SecureStorage = {
  users: {},
  sessions: {},
}

// Get the secure storage
export async function getSecureStorage(): Promise<SecureStorage> {
  return memoryStorage
}

// Set the secure storage
export async function setSecureStorage(storage: SecureStorage): Promise<void> {
  memoryStorage = storage
}
