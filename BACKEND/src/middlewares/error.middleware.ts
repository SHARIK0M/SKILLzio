import { Request, Response, NextFunction } from 'express'

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  const error = err.error || 'UnhandledError'

  res.status(status).json({
    statusCode: status,
    success: false,
    message,
    error,
  })
}
