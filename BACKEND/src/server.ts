import app from './app'
import { connectDB } from './config/db'
import dotenv from 'dotenv'
dotenv.config()

const startServer = async () => {
  await connectDB()

  app.listen(process.env.PORT, () => {
    console.log(` Server running on http://localhost:${process.env.PORT}`)
  })
}

startServer()
