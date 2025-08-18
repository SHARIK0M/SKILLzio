import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { JwtService } from '../utils/jwt'
import { AuthErrorMsg } from '../utils/constants'
import { StatusCode } from '../utils/enums'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string

// Extend Express Request to include user info decoded from token
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    iat: number // issued at timestamp
    exp: number // expiration timestamp
  }
}

// Middleware to authenticate JWT tokens from cookies
const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  // Extract access and refresh tokens from cookies
  const accessToken = req.cookies['accessToken']
  const refreshToken = req.cookies['refreshToken']

  // If no access token found, reject request with 401 Unauthorized
  if (!accessToken) {
    console.log('❌ No accessToken found in cookies')
    return res
      .status(StatusCode.UNAUTHORIZED)
      .json({ failToken: true, message: AuthErrorMsg.NO_ACCESS_TOKEN })
  }

  try {
    // Verify Access Token using JWT_SECRET
    const accessPayload = jwt.verify(accessToken, JWT_SECRET) as AuthenticatedRequest['user']

    // Attach decoded user payload to request for downstream handlers
    req.user = accessPayload
    return next() // Continue to next middleware or route handler
  } catch (err: any) {
    // If access token expired, try to verify refresh token and issue new access token
    if (err.name === AuthErrorMsg.TOKEN_EXPIRED_NAME) {
      // If no refresh token found, reject with 401 Unauthorized
      if (!refreshToken) {
        return res
          .status(StatusCode.UNAUTHORIZED)
          .json({ failToken: true, message: AuthErrorMsg.NO_REFRESH_TOKEN })
      }

      try {
        // Verify Refresh Token
        const refreshPayload = jwt.verify(refreshToken, JWT_SECRET) as AuthenticatedRequest['user']

        // If refresh token invalid, reject
        if (!refreshPayload) {
          return res
            .status(StatusCode.UNAUTHORIZED)
            .json({ message: AuthErrorMsg.INVALID_REFRESH_TOKEN })
        }

        // Check if refresh token is expired (compare exp with current time)
        const currentTime = Math.floor(Date.now() / 1000)
        if (refreshPayload.exp && refreshPayload.exp < currentTime) {
          return res
            .status(StatusCode.UNAUTHORIZED)
            .json({ message: AuthErrorMsg.REFRESH_TOKEN_EXPIRED })
        }

        // Generate new Access Token from refresh token payload info
        const jwtService = new JwtService()
        const newAccessToken = await jwtService.accessToken({
          id: refreshPayload.id,
          email: refreshPayload.email,
          role: refreshPayload.role,
        })

        console.log('new Access Token', newAccessToken)

        // Set new access token as httpOnly cookie in response
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          // optionally add secure: true in production for HTTPS
        })

        // Update request cookies and user info with new access token data
        req.cookies['accessToken'] = newAccessToken
        req.user = refreshPayload

        return next() // Continue with refreshed token
      } catch (refreshErr: any) {
        // Handle refresh token errors (expired or invalid)
        if (refreshErr.name === AuthErrorMsg.TOKEN_EXPIRED_NAME) {
          return res
            .status(StatusCode.UNAUTHORIZED)
            .json({ message: AuthErrorMsg.REFRESH_TOKEN_EXPIRED })
        }

        return res
          .status(StatusCode.UNAUTHORIZED)
          .json({ message: AuthErrorMsg.INVALID_ACCESS_TOKEN })
      }
    }

    // For other access token verification errors, return bad request
    return res.status(StatusCode.BAD_REQUEST).json({ message: AuthErrorMsg.INVALID_ACCESS_TOKEN })
  }
}

export default authenticateToken
