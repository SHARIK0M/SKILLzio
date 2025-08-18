import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import dotenv from 'dotenv'
dotenv.config()
import { errorMiddleware } from './middlewares/error.middleware'
import { logger } from './config/logger'
import adminRoutes from './routes/admin.Routes'
import studentRoutes from "./routes/student.Routes"
import instructorRoutes from './routes/instructor.Routes'

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
)
app.use(logger)
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use("/api/student",studentRoutes)
app.use("/api/admin",adminRoutes)
app.use("/api/instructor", instructorRoutes)

// Routes will go here

app.use(errorMiddleware)

export default app
