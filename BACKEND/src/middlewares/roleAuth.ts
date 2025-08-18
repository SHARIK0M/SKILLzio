import { Roles, StatusCode } from '../utils/enums'
import { JwtService } from '../utils/jwt'
import { Request, Response, NextFunction } from 'express'
import { AuthErrorMsg } from '../utils/constants'

// Middleware to authorize only STUDENT users
export const isStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract access token from cookies
    const Token = req.cookies.accessToken

    // If no token, deny access with 401 Unauthorized
    if (!Token) {
      res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.ACCESS_FORBIDDEN)
      return
    }

    // Verify token and decode payload
    const JWT = new JwtService()
    const decode = await JWT.verifyToken(Token)

    // Check if user role is STUDENT, else deny access
    if (decode?.role !== Roles.STUDENT) {
      res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.ACCESS_FORBIDDEN)
      return
    }
    next() // User is authorized, proceed to next middleware/handler
  } catch (error) {
    // If token verification fails, respond with invalid token error
    res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.INVALID_ACCESS_TOKEN)
  }
}

// Middleware to authorize only INSTRUCTOR users
export const isInstructor = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Extract access token from cookies[]
    const Token = req.cookies.accessToken
    if (!Token) {
      res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.ACCESS_FORBIDDEN)
      return
    }

    // Verify token and decode payload
    const JWT = new JwtService()
    const decode = await JWT.verifyToken(Token)

    // If decoded token exists, check if role is INSTRUCTOR
    if (decode) {
      if (decode.role != Roles.INSTRUCTOR) {
        res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.ACCESS_FORBIDDEN)
        return
      }
    }

    next() // Authorized, proceed further
  } catch (error) {
    // For any error, throw so error handling middleware can catch
    throw error
  }
}

// Middleware to authorize only ADMIN users
export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract access token from cookies
    const Token = req.cookies.accessToken

    // If token missing, deny access
    if (!Token) {
      res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.ACCESS_FORBIDDEN)
      return
    }

    // Verify token and decode payload
    const JWT = new JwtService()
    const decode = await JWT.verifyToken(Token)

    // Check role is ADMIN, else deny access
    if (decode) {
      if (decode.role != Roles.ADMIN) {
        res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.ACCESS_FORBIDDEN)
        return
      }
    }
    next() // Authorized, continue processing
  } catch (error) {
    // Throw error to be handled by error middleware
    throw error
  }
}
