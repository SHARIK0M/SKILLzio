import app from './app'
import { connectDB } from './config/db'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { startMembershipExpiryJob } from './cron/membershipExpiryJob'
import { initializeSocketIO } from './sockets/socketServer'

dotenv.config()
const port: number = Number(process.env.PORT) || 8000

const start = async () => {
  try {
    await connectDB() // Connect to MongoDB
    console.log(' Database connected successfully')

    startMembershipExpiryJob() // Start CRON job
    console.log(' Membership expiry job started')

    const httpServer = createServer(app) // Create raw HTTP server

    // Create Socket.IO server with CORS configuration
    const io = new Server(httpServer, {
      cors: {
        origin: String(process.env.FRONTEND_URL),
        methods: ['GET', 'POST'],
        credentials: true,
      },
      allowEIO3: true, // Allow Engine.IO v3 clients
      transports: ['websocket', 'polling'], // Support both transports
    })

    // Initialize Socket.IO with the created server
    await initializeSocketIO(io)
    console.log(' Socket.IO initialized successfully')

    httpServer.listen(port, () => {
      console.log(` Server is running on port ${port}`)
      console.log(` Frontend URL: ${process.env.FRONTEND_URL}`)
      console.log(` Socket.IO is ready for connections`)
    })
  } catch (error) {
    console.error(' Failed to start server:', error)
    process.exit(1)
  }
}

start()
