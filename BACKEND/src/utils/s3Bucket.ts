import AWS from 'aws-sdk'
import { S3BucketErrors } from './constants'

// Define the structure for a Multer file object
export interface IMulterFile {
  originalname: string // Name of the file as uploaded by the user
  buffer: Buffer // File data stored in memory (from multer.memoryStorage)
  mimetype: string // MIME type of the file (e.g., "image/png", "application/pdf")
}

/**
 * Upload a file to AWS S3 Bucket
 * @param file - File object (from multer)
 * @param folderName - Folder path in the bucket where file will be stored
 * @returns Promise<string> - Returns the uploaded file's key (path in the bucket)
 */
export async function uploadToS3Bucket(file: IMulterFile, folderName: string): Promise<string> {
  try {
    // Validate that a file is provided
    if (!file) {
      throw new Error(S3BucketErrors.NO_FILE)
    }

    // Ensure required S3 environment variables are set
    if (
      !process.env.BUCKET_NAME ||
      !process.env.BUCKET_ACCESS_KEY ||
      !process.env.BUCKET_SECRET_ACCESS_KEY ||
      !process.env.BUCKET_REGION
    ) {
      throw new Error(S3BucketErrors.BUCKET_REQUIREMENT_MISSING)
    }

    // Remove trailing slash from folder name (if exists) to avoid double slashes
    const normalizedFolder = folderName.replace(/\/$/, '')

    // Configure S3 upload parameters
    const params: any = {
      Bucket: process.env.BUCKET_NAME, // Target S3 bucket
      Key: `${normalizedFolder}/${Date.now()}_${file.originalname}`, // Unique file key (folder + timestamp + original name)
      Body: file.buffer, // File data (from multer memory storage)
      ContentType: file.mimetype, // File type
    }

    // Configure AWS credentials and region
    AWS.config.update({
      accessKeyId: process.env.BUCKET_ACCESS_KEY,
      secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
      region: process.env.BUCKET_REGION,
    })

    // Create an S3 instance
    const s3 = new AWS.S3()

    // Upload file to S3 and wait for the result
    const uploadedResult = await s3.upload(params).promise()

    // Validate upload result
    if (!uploadedResult || !uploadedResult.Location) {
      throw new Error(S3BucketErrors.ERROR_GETTING_IMAGE)
    }

    // Return the file key (useful for retrieving or generating file URLs later)
    return uploadedResult.Key
  } catch (error: any) {
    // Log error for debugging and re-throw to be handled by caller
    console.error('s3 upload failed', error.message)
    throw error
  }
}
