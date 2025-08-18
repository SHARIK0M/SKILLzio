// src/config/db.ts
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('❌ MONGO_URI is not defined in your .env file')
    }

    await mongoose.connect(process.env.MONGO_URI, {
      // optional mongoose options (can remove if not needed)
      autoIndex: true,
    })

    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', (error as Error).message)
    process.exit(1)
  }
}
