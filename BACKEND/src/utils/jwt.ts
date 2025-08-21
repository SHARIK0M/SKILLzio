import jwt from 'jsonwebtoken'
import { EnvErrorMsg, JwtErrorMsg } from './constants'
import dotenv from 'dotenv'

// Load environment variables from the .env file
dotenv.config()

export class JwtService {
  /**
   * Create a generic JWT token
   * @param payload - The data to embed inside the token (e.g., user id, role, email, etc.)
   * @returns A signed JWT token string
   */
  async createToken(payload: Object): Promise<string> {
    // Get the JWT secret from environment variables
    const secret = process.env.JWT_SECRET

    // If secret key is missing, throw an error
    if (!secret) {
      throw new Error(EnvErrorMsg.JWT_NOT_FOUND)
    }

    // Sign the token with the given payload, secret, and expiration time
    const verifyToken = await jwt.sign(payload, secret, {
      expiresIn: JwtErrorMsg.JWT_EXPIRATION, // Expiration time (example: "1h")
    })

    // Debug log: show the payload being signed
    console.log('payload', payload)

    // Return the generated token
    return verifyToken
  }

  /**
   * Create an Access Token
   * - Short-lived token
   * - Used for authenticated API requests
   * @param payload - The data to embed inside the token
   * @returns Signed access token string
   */
  async accessToken(payload: Object): Promise<string> {
    const secret = process.env.JWT_SECRET

    if (!secret) {
      throw new Error(EnvErrorMsg.JWT_NOT_FOUND)
    }

    // Debug log: show payload
    console.log('accessToken', payload)

    // Return a signed short-lived token
    return jwt.sign(payload, secret, {
      expiresIn: JwtErrorMsg.JWT_EXPIRATION,
    })
  }

  /**
   * Create a Refresh Token
   * - Long-lived token
   * - Used to generate new access tokens without forcing re-login
   * @param payload - The data to embed inside the token
   * @returns Signed refresh token string
   */
  async refreshToken(payload: Object): Promise<string> {
    const secret = process.env.JWT_SECRET

    if (!secret) {
      throw new Error(EnvErrorMsg.JWT_NOT_FOUND)
    }

    // Sign refresh token with a longer expiration time
    const verifyToken = await jwt.sign(payload, secret, {
      expiresIn: JwtErrorMsg.JWT_REFRESH_EXPIRATION, // Example: "7d"
    })

    return verifyToken
  }

  /**
   * Verify a JWT token
   * - Checks if token is valid
   * - Returns decoded payload if valid
   * @param token - JWT token string
   * @returns Decoded token data (payload)
   */
  async verifyToken(token: string): Promise<any> {
    try {
      // Get JWT secret from environment, fallback to "LIFEISGOOD" if missing
      // (fallback should not be used in production)
      const secret = process.env.JWT_SECRET || 'LIFEISGOOD'

      // Verify token and return decoded payload
      const data = await jwt.verify(token, secret)

      return data
    } catch (error) {
      // Log error if token verification fails
      console.error('Token verification failed:', error)
      throw error
    }
  }
}
