import { Roles, StatusCode } from '../types/enums'
import { JwtService } from '../utils/jwt'
import { Request, Response, NextFunction } from 'express'
import { AuthErrorMsg } from '../types/constants'

/**
 * Middleware to allow access only for STUDENT users
 */
export const isStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Step 1: Read access token from cookies
    const Token = req.cookies.accessToken

    // Step 2: If no token is present, block access
    if (!Token) {
      res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.ACCESS_FORBIDDEN)
      return
    }

    // Step 3: Verify token using JwtService
    const JWT = new JwtService()
    const decode = await JWT.verifyToken(Token)

    // Step 4: Check if decoded role is STUDENT
    if (decode?.role !== Roles.STUDENT) {
      res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.ACCESS_FORBIDDEN)
      return
    }

    // Step 5: Role is valid, move to next middleware
    next()
  } catch (error) {
    // Step 6: If token invalid or verification fails
    res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.INVALID_ACCESS_TOKEN)
  }
}

/**
 * Middleware to allow access only for INSTRUCTOR users
 */
export const isInstructor = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Step 1: Read access token from cookies
    const Token = req.cookies.accessToken

    // Step 2: If no token is found, block access
    if (!Token) {
      res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.ACCESS_FORBIDDEN)
      return
    }

    // Step 3: Verify token
    const JWT = new JwtService()
    const decode = await JWT.verifyToken(Token)

    // Step 4: If decoded token exists, check role
    if (decode) {
      // Step 5: If role is not INSTRUCTOR, block access
      if (decode.role != Roles.INSTRUCTOR) {
        res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.ACCESS_FORBIDDEN)
        return
      }
    }

    // Step 6: Role valid, continue request
    next()
  } catch (error) {
    // Step 7: If error occurs, throw to be handled globally
    throw error
  }
}

/**
 * Middleware to allow access only for ADMIN users
 */
export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Step 1: Extract token from cookies
    const Token = req.cookies.accessToken

    // Step 2: If token missing, deny access
    if (!Token) {
      res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.ACCESS_FORBIDDEN)
      return
    }

    // Step 3: Verify token
    const JWT = new JwtService()
    const decode = await JWT.verifyToken(Token)

    // Step 4: If decoded token exists, check role
    if (decode) {
      // Step 5: Allow only ADMIN role
      if (decode.role != Roles.ADMIN) {
        res.status(StatusCode.UNAUTHORIZED).send(AuthErrorMsg.ACCESS_FORBIDDEN)
        return
      }
    }

    // Step 6: If role is ADMIN, allow request to continue
    next()
  } catch (error) {
    // Step 7: Pass error to error handling middleware
    throw error
  }
}
