import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { JwtService } from '../utils/jwt'
import { AuthErrorMsg } from '../utils/constants'
import { StatusCode } from '../utils/enums'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string

// Extend Express Request type to include decoded user info from token
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    iat: number // token issued-at timestamp
    exp: number // token expiration timestamp
  }
}

// Middleware function to check and validate JWT tokens from cookies
const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  // Step 1: Get tokens from cookies
  const accessToken = req.cookies['accessToken']
  const refreshToken = req.cookies['refreshToken']

  // Step 2: If no access token is present, reject with 401 Unauthorized
  if (!accessToken) {
    console.log('No accessToken found in cookies')
    return res
      .status(StatusCode.UNAUTHORIZED)
      .json({ failToken: true, message: AuthErrorMsg.NO_ACCESS_TOKEN })
  }

  try {
    // Step 3: Verify access token with secret
    const accessPayload = jwt.verify(accessToken, JWT_SECRET) as AuthenticatedRequest['user']

    // Step 4: Attach decoded user info to request object
    req.user = accessPayload

    // Step 5: Pass request to next handler
    return next()
  } catch (err: any) {
    // Step 6: If access token has expired
    if (err.name === AuthErrorMsg.TOKEN_EXPIRED_NAME) {
      // Step 7: If no refresh token exists, reject with 401
      if (!refreshToken) {
        return res
          .status(StatusCode.UNAUTHORIZED)
          .json({ failToken: true, message: AuthErrorMsg.NO_REFRESH_TOKEN })
      }

      try {
        // Step 8: Verify refresh token
        const refreshPayload = jwt.verify(refreshToken, JWT_SECRET) as AuthenticatedRequest['user']

        // Step 9: If refresh token invalid, reject with 401
        if (!refreshPayload) {
          return res
            .status(StatusCode.UNAUTHORIZED)
            .json({ message: AuthErrorMsg.INVALID_REFRESH_TOKEN })
        }

        // Step 10: Check refresh token expiration against current time
        const currentTime = Math.floor(Date.now() / 1000)
        if (refreshPayload.exp && refreshPayload.exp < currentTime) {
          return res
            .status(StatusCode.UNAUTHORIZED)
            .json({ message: AuthErrorMsg.REFRESH_TOKEN_EXPIRED })
        }

        // Step 11: Create a new access token from refresh token payload
        const jwtService = new JwtService()
        const newAccessToken = await jwtService.accessToken({
          id: refreshPayload.id,
          email: refreshPayload.email,
          role: refreshPayload.role,
        })

        console.log('new Access Token', newAccessToken)

        // Step 12: Set new access token as a secure HTTP-only cookie
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          // secure: true can be added in production for HTTPS
        })

        // Step 13: Update request cookies and attach user info
        req.cookies['accessToken'] = newAccessToken
        req.user = refreshPayload

        // Step 14: Continue with refreshed token
        return next()
      } catch (refreshErr: any) {
        // Step 15: If refresh token expired, return 401
        if (refreshErr.name === AuthErrorMsg.TOKEN_EXPIRED_NAME) {
          return res
            .status(StatusCode.UNAUTHORIZED)
            .json({ message: AuthErrorMsg.REFRESH_TOKEN_EXPIRED })
        }

        // Step 16: Any other refresh token error → invalid access token
        return res
          .status(StatusCode.UNAUTHORIZED)
          .json({ message: AuthErrorMsg.INVALID_ACCESS_TOKEN })
      }
    }

    // Step 17: If access token fails for other reasons, return 400
    return res.status(StatusCode.BAD_REQUEST).json({ message: AuthErrorMsg.INVALID_ACCESS_TOKEN })
  }
}

export default authenticateToken
