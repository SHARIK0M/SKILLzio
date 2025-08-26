import { Request, Response, NextFunction } from 'express'
import { IInstructorChapterController } from './interfaces/IInstructorChapterController'
import { IInstructorChapterService } from '../../services/instructorServices/interfaces/IInstructorChapterService'
import { StatusCode } from '../../types/enums'
import { uploadToS3Bucket } from '../../utils/s3Bucket'
import { getPresignedUrl } from '../../utils/getPresignedUrl'
import { ChapterErrorMessages, ChapterSuccessMessages } from '../../types/constants'

// Controller responsible for handling Chapter-related operations for instructors
export class InstructorChapterController implements IInstructorChapterController {
  private chapterService: IInstructorChapterService

  constructor(chapterService: IInstructorChapterService) {
    this.chapterService = chapterService
  }

  // Create a new chapter for a course
  async createChapter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { chapterTitle, chapterNumber, description, courseId } = req.body

      // Check if chapter with same title or number already exists in the course
      const existing = await this.chapterService.findByTitleOrNumberAndCourseId(
        courseId,
        chapterTitle,
        Number(chapterNumber),
      )
      if (existing) {
        res.status(StatusCode.CONFLICT).json({
          success: false,
          message:
            existing.chapterTitle.toLowerCase() === chapterTitle.toLowerCase()
              ? ChapterErrorMessages.CHAPTER_ALREADY_EXIST
              : ChapterErrorMessages.CHAPTER_NUMBER_ALREADY_EXIST,
        })
        return
      }

      // Extract uploaded files from request
      const files = req.files as { [fieldname: string]: Express.Multer.File[] }
      const videoFile = files['video']?.[0]
      const captionsFile = files['captions']?.[0]

      // A chapter must always include a video file
      if (!videoFile) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: ChapterErrorMessages.CHAPTER_REQUIRE_VIDEOFILE,
        })
        return
      }

      // Upload video file to S3
      const videoUrl = await uploadToS3Bucket(
        {
          originalname: videoFile.originalname,
          buffer: videoFile.buffer,
          mimetype: videoFile.mimetype,
        },
        'chapters/videos',
      )

      // Upload captions file to S3 if provided
      let captionsUrl: string | undefined
      if (captionsFile) {
        captionsUrl = await uploadToS3Bucket(
          {
            originalname: captionsFile.originalname,
            buffer: captionsFile.buffer,
            mimetype: captionsFile.mimetype,
          },
          'chapters/captions',
        )
      }

      // Prepare chapter data
      const chapterDTO = {
        chapterTitle,
        chapterNumber: Number(chapterNumber),
        courseId,
        description,
        videoUrl,
        captionsUrl,
      }

      // Save new chapter
      const chapter = await this.chapterService.createChapter(chapterDTO)

      res.status(StatusCode.CREATED).json({
        success: true,
        message: ChapterSuccessMessages.CHAPTER_CREATED,
        data: chapter,
      })
    } catch (error) {
      next(error)
    }
  }

  // Fetch all chapters by course with pagination and search
  async getChaptersByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params
      const { page = 1, limit = 10, search = '' } = req.query

      // Build search filter for title or chapter number
      const filter: any = {
        courseId,
        ...(search && {
          $or: [
            { chapterTitle: { $regex: search, $options: 'i' } },
            { chapterNumber: isNaN(Number(search)) ? -1 : Number(search) },
          ],
        }),
      }

      // Get paginated chapters
      const { data, total } = await this.chapterService.paginateChapters(
        filter,
        Number(page),
        Number(limit),
      )

      res.status(StatusCode.OK).json({
        success: true,
        data,
        total,
        message: ChapterSuccessMessages.CHAPTER_RETRIEVED,
      })
    } catch (error) {
      next(error)
    }
  }

  // Update existing chapter details (title, number, description, files)
  async updateChapter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { chapterId } = req.params
      const { chapterTitle, chapterNumber, description } = req.body

      const files = req.files as { [fieldname: string]: Express.Multer.File[] }

      let videoUrl: string | undefined
      let captionsUrl: string | undefined

      // Upload new video file if provided
      const videoFile = files?.['video']?.[0]
      if (videoFile) {
        videoUrl = await uploadToS3Bucket(
          {
            originalname: videoFile.originalname,
            buffer: videoFile.buffer,
            mimetype: videoFile.mimetype,
          },
          'chapters/videos',
        )
      }

      // Upload new captions file if provided
      const captionsFile = files?.['captions']?.[0]
      if (captionsFile) {
        captionsUrl = await uploadToS3Bucket(
          {
            originalname: captionsFile.originalname,
            buffer: captionsFile.buffer,
            mimetype: captionsFile.mimetype,
          },
          'chapters/captions',
        )
      }

      // Check if another chapter with same title/number exists in the same course
      const existing = await this.chapterService.findByTitleOrNumberAndCourseId(
        req.body.courseId,
        chapterTitle,
        Number(chapterNumber),
      )
      if (existing && existing._id.toString() !== chapterId) {
        res.status(StatusCode.CONFLICT).json({
          success: false,
          message:
            existing.chapterTitle.toLowerCase() === chapterTitle.toLowerCase()
              ? ChapterErrorMessages.CHAPTER_ALREADY_EXIST
              : ChapterErrorMessages.CHAPTER_NUMBER_ALREADY_EXIST,
        })
        return
      }

      // Prepare updated chapter data
      const updatedChapterData: any = {
        chapterTitle,
        chapterNumber: Number(chapterNumber),
        description,
      }
      if (videoUrl) updatedChapterData.videoUrl = videoUrl
      if (captionsUrl) updatedChapterData.captionsUrl = captionsUrl

      // Update chapter in DB
      const updated = await this.chapterService.updateChapter(chapterId, updatedChapterData)

      if (!updated) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: ChapterErrorMessages.CHAPTER_NOT_FOUND,
        })
        return
      }

      res.status(StatusCode.OK).json({
        success: true,
        data: updated,
        message: ChapterSuccessMessages.CHAPTER_UPDATED,
      })
    } catch (error) {
      next(error)
    }
  }

  // Delete a chapter by its ID
  async deleteChapter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { chapterId } = req.params

      const deleted = await this.chapterService.deleteChapter(chapterId)

      if (!deleted) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: ChapterErrorMessages.CHAPTER_NOT_FOUND,
        })
        return
      }

      res.status(StatusCode.OK).json({
        success: true,
        message: ChapterSuccessMessages.CHAPTER_DELETED,
      })
    } catch (error) {
      next(error)
    }
  }

  // Fetch a single chapter by ID, including presigned URLs for files
  async getChapterById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { chapterId } = req.params
      const chapter = await this.chapterService.getChapterById(chapterId)

      if (!chapter) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: ChapterSuccessMessages.CHAPTER_DELETED,
        })
        return
      }

      // Generate temporary pre-signed URLs for video and captions
      let videoPresignedUrl = null
      let captionsPresignedUrl = null

      if (chapter.videoUrl) {
        videoPresignedUrl = await getPresignedUrl(chapter.videoUrl)
      }

      if (chapter.captionsUrl) {
        captionsPresignedUrl = await getPresignedUrl(chapter.captionsUrl)
      }

      res.status(StatusCode.OK).json({
        success: true,
        data: {
          ...chapter.toObject(),
          videoPresignedUrl,
          captionsPresignedUrl,
        },
      })
    } catch (error) {
      next(error)
    }
  }
}
