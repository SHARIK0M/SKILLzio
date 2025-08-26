import { CreateChapterDTO, IChapter } from "../../models/chapter.Model";
import { IInstructorChapterRepository } from "../../repositories/instructorRepository/interfaces/IInstructorChapterRepository";
import { IInstructorChapterService } from "./interfaces/IInstructorChapterService";

export class InstructorChapterService implements IInstructorChapterService {
  constructor(private chapterRepo: IInstructorChapterRepository) {}

  async createChapter(data: CreateChapterDTO): Promise<IChapter> {
    return this.chapterRepo.createChapter(data);
  }

  async getChaptersByCourse(courseId: string): Promise<IChapter[]> {
    return this.chapterRepo.getChaptersByCourse(courseId);
  }

  async getChapterById(chapterId: string): Promise<IChapter | null> {
    return this.chapterRepo.getChapterById(chapterId);
  }

  async updateChapter(chapterId: string, data: Partial<IChapter>): Promise<IChapter | null> {
    return this.chapterRepo.updateChapter(chapterId, data);
  }

  async deleteChapter(chapterId: string): Promise<IChapter | null> {
    return this.chapterRepo.deleteChapter(chapterId);
  }

 async findByTitleOrNumberAndCourseId(
  courseId: string,
  chapterTitle: string,
  chapterNumber: number
): Promise<IChapter | null> {
  return this.chapterRepo.findByTitleOrNumberAndCourseId(courseId, chapterTitle, chapterNumber);
}

async paginateChapters(filter: object, page: number, limit: number) {
  return this.chapterRepo.paginateChapters(filter, page, limit);
}


}
