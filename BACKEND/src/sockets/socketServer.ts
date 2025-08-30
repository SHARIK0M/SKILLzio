import * as cookie from 'cookie'
import dotenv from 'dotenv'
import { JwtService } from '../utils/jwt'
dotenv.config()

import { Server, Socket } from 'socket.io'
// Server - represents the socket.io server instance
// Socket - represents each individual client connection
import studentCollection from '../models/user.Model'
import instructorCollection from '../models/instructor.Model'

interface OnlineUser {
  id: string // Database ObjectId of the user (string form)
  userId: string // User's email (used as unique identifier)
  socketId: string // Current socket connection id
  lastActive: number // Timestamp of last activity (for cleanup)
  role?: string // Role of the user (student or instructor)
}

interface DecodedToken {
  email: string // Extracted email from JWT
  role: string // Extracted role from JWT
  [key: string]: any // Allow additional dynamic properties
}

// Singleton class to manage socket connections across the app
// Ensures only one instance exists for managing online users
class SocketManager {
  private static instance: SocketManager
  private onlineUsers: Map<string, OnlineUser> = new Map()

  private constructor() {
    // Periodically remove inactive users every 30 minutes
    setInterval(() => this.cleanupInactiveUsers(), 1000 * 60 * 30)
  }

  // Returns the single shared instance of SocketManager
  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  // Add or update a user in the online users map
  public addUser(id: string, userId: string, socketId: string, role?: string): void {
    this.onlineUsers.set(userId, {
      id,
      userId,
      socketId,
      lastActive: Date.now(),
      role,
    })
  }

  // Remove a user from the online users map using userId (email)
  public removeUser(userId: string): void {
    this.onlineUsers.delete(userId)
  }

  // Get socket id of a user by their userId (email)
  public getUserSocketId(userId: string): string | undefined {
    return this.onlineUsers.get(userId)?.socketId
  }

  // Get full OnlineUser object by userId (email)
  public getUserSocketIdByUserId(email: string): OnlineUser | undefined {
    return this.onlineUsers.get(email)
  }

  // Get a list of all currently online users
  public getAllOnlineUsers(): OnlineUser[] {
    return Array.from(this.onlineUsers.values())
  }

  // Clean inactive users after a specified max inactivity period (default: 30 mins)
  private cleanupInactiveUsers(maxInactivityTime = 1000 * 60 * 30): void {
    const now = Date.now()
    this.onlineUsers.forEach((user, userId) => {
      if (now - user.lastActive > maxInactivityTime) {
        this.onlineUsers.delete(userId)
      }
    })
  }
}

// Initialize the socket.io server and register event handlers
async function initializeSocketIO(io: Server) {
  console.log('Initializing Socket.IO')
  const socketManager = SocketManager.getInstance()

  // Middleware: authenticate user before establishing socket connection
  io.use(async (socket: Socket, next) => {
    try {
      // Extract token from cookie or handshake
      const token = extractToken(socket)
      const jwtService = new JwtService()
      const JWT_SECRET = process.env.JWT_SECRET || 'MYLIFEMYRULE'
      if (!JWT_SECRET) {
        throw new Error('JWT Secret not configured')
      }

      // Verify token
      const decodedToken = (await jwtService.verifyToken(token)) as DecodedToken
      if (!decodedToken?.email || !decodedToken?.role) {
        throw new Error('Invalid or malformed token')
      }

      // Find entity (student or instructor) in DB
      let entity
      if (decodedToken.role === 'student') {
        entity = await studentCollection.findOne({ email: decodedToken.email })
      } else if (decodedToken.role === 'instructor') {
        entity = await instructorCollection.findOne({ email: decodedToken.email })
      } else {
        throw new Error('Invalid role in token')
      }

      if (!entity) {
        throw new Error('Entity not found')
      }

      // Attach authenticated entity and metadata to socket
      socket.data.entity = entity
      socket.data.email = decodedToken.email
      socket.data.role = decodedToken.role
      next()
    } catch (error: any) {
      console.error('Authentication error:', error.message)
      next(new Error(error.message || 'Authentication failed'))
    }
  })

  // Handle new socket connections
  io.on('connection', (socket) => {
    console.log(`${socket.data.role} connected: ${socket.id}, Email: ${socket.data.email}`)

    // Add user to online list
    socketManager.addUser(
      String(socket.data.entity._id),
      socket.data.entity.email,
      socket.id,
      socket.data.role,
    )

    // Notify others that a user is online
    socket.broadcast.emit('user:online', {
      email: socket.data.email,
      role: socket.data.role,
    })

    // Event: initiating an outgoing call
    socket.on('outgoing:call', (data) => {
      const { to, fromOffer } = data
      const recipientSocketId = socketManager.getUserSocketIdByUserId(to)

      if (!recipientSocketId) {
        // If recipient is offline
        socket.emit('call:error', {
          message: `User ${to} is not online`,
          code: 'USER_OFFLINE',
        })
        return
      }

      // Log call initiation
      console.log(`${socket.data.role} (${socket.data.email}) initiating call to ${to}`)

      // Notify recipient about incoming call
      io.to(recipientSocketId.socketId).emit('incoming:call', {
        from: socket.data.email, // caller's email
        fromRole: socket.data.role, // caller's role
        offer: fromOffer,
        userEmail: recipientSocketId.userId,
      })
    })

    // Event: call accepted
    socket.on('call:accepted', (data) => {
      const { to, answer } = data
      const recipientSocketId = socketManager.getUserSocketIdByUserId(to)

      if (recipientSocketId) {
        console.log(`Call accepted between ${socket.data.email} and ${to}`)

        io.to(recipientSocketId.socketId).emit('incoming:answer', {
          from: socket.data.email,
          fromRole: socket.data.role,
          answer,
        })
      }
    })

    // Event: exchange ICE candidates for WebRTC
    socket.on('ice:candidate', (data) => {
      const { to, candidate } = data
      const recipientSocketId = socketManager.getUserSocketIdByUserId(to)

      if (recipientSocketId) {
        io.to(recipientSocketId.socketId).emit('ice:candidate', {
          from: socket.data.email,
          candidate,
        })
      }
    })

    // Event: end a call
    socket.on('end:call', (data) => {
      const { to } = data
      const recipientSocketId = socketManager.getUserSocketIdByUserId(to)

      if (recipientSocketId) {
        console.log(`Call ended between ${socket.data.email} and ${to}`)

        io.to(recipientSocketId.socketId).emit('call:ended', {
          from: socket.data.email,
          fromRole: socket.data.role,
        })
      }
    })

    // Event: reject a call
    socket.on('call:rejected', (data) => {
      const { to } = data
      const recipientSocketId = socketManager.getUserSocketIdByUserId(to)

      if (recipientSocketId) {
        console.log(`Call rejected by ${socket.data.email} from ${to}`)

        io.to(recipientSocketId.socketId).emit('call:rejected', {
          from: socket.data.email,
          fromRole: socket.data.role,
        })
      }
    })

    // Event: disconnect
    socket.on('disconnect', () => {
      console.log(`${socket.data.role} disconnected: ${socket.id}, Email: ${socket.data.email}`)
      socketManager.removeUser(socket.data.entity.email)

      // Notify others that the user is offline
      socket.broadcast.emit('user:offline', {
        email: socket.data.email,
        role: socket.data.role,
      })
    })
  })
}

// Utility function: extract JWT token from cookies or socket handshake
function extractToken(socket: Socket): string {
  const cookies = cookie.parse(socket.handshake.headers?.cookie || '')

  // Check token from cookie or socket auth
  const token = cookies.accessToken || socket.handshake.auth?.token

  if (!token) {
    throw new Error('No authentication token provided')
  }
  return token
}

export { initializeSocketIO, SocketManager }
