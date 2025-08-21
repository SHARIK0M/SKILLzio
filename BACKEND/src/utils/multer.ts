import multer from 'multer'

// Configure multer to store uploaded files in memory as Buffer objects
// (useful when files are uploaded to cloud storage like AWS S3, GCP, etc.)
const storage = multer.memoryStorage()

// Initialize multer with custom settings
const upload = multer({
  storage, // Use memory storage (no local disk storage)
  limits: {
    // Limit the file size to 200 MB (200 * 1024 * 1024 bytes)
    fileSize: 200 * 1024 * 1024,
  },
})

// Export the configured multer instance so it can be used in routes
export default upload
