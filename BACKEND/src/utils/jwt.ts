import jwt from 'jsonwebtoken'
import { EnvErrorMsg, JwtErrorMsg } from './constants'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

export class JwtService {
  /**
   * Create a generic JWT token
   * @param payload - The data you want to embed in the token (e.g., user id, role)
   * @returns A signed JWT token string
   */
  async createToken(payload: Object): Promise<string> {
    const secret = process.env.JWT_SECRET // Get secret key from environment

    if (!secret) {
      // If no secret found, throw error
      throw new Error(EnvErrorMsg.JWT_NOT_FOUND)
    }

    // Sign the token with payload, secret, and expiration time
    const verifyToken = await jwt.sign(payload, secret, {
      expiresIn: JwtErrorMsg.JWT_EXPIRATION, // e.g., "1h" or "15m"
    })

    console.log('payload', payload) // Debug log: show what data is inside token

    return verifyToken
  }

  /**
   * Create an Access Token (short-lived)
   * Used for authenticated API requests
   * @param payload - Data to store in token (e.g., user details)
   */
  async accessToken(payload: Object): Promise<string> {
    const secret = process.env.JWT_SECRET // Get secret key from environment

    if (!secret) {
      throw new Error(EnvErrorMsg.JWT_NOT_FOUND)
    }

    console.log('accessToken', payload) // Debug log

    // Return short-lived token
    return jwt.sign(payload, secret, {
      expiresIn: JwtErrorMsg.JWT_EXPIRATION,
    })
  }

  /**
   * Create a Refresh Token (long-lived)
   * Used to generate new access tokens without re-login
   * @param payload - Data to store in token
   */
  async refreshToken(payload: Object): Promise<string> {
    const secret = process.env.JWT_SECRET

    if (!secret) {
      throw new Error(EnvErrorMsg.JWT_NOT_FOUND)
    }

    // Sign the refresh token with longer expiration
    const verifyToken = await jwt.sign(payload, secret, {
      expiresIn: JwtErrorMsg.JWT_REFRESH_EXPIRATION, // e.g., "7d" or "30d"
    })

    return verifyToken
  }

  /**
   * Verify if a token is valid and return its payload
   * @param token - JWT token string
   * @returns Decoded token data if valid, else throws error
   */
  async verifyToken(token: string): Promise<any> {
    try {
      // Fallback to 'LIFEISGOOD' if JWT_SECRET not set (not recommended in production)
      const secret = process.env.JWT_SECRET || 'LIFEISGOOD'

      // Verify the token and decode the payload
      const data = await jwt.verify(token, secret)

      return data
    } catch (error) {
      // Log the error if verification fails
      console.error('❌ Token verification failed:', error)
      throw error
    }
  }
}
