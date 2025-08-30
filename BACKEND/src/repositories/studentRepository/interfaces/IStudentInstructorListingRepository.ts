import { IInstructor } from "../../../models/instructor.Model";

export interface IStudentInstructorListingRepository {
  listMentorInstructorsPaginated(
    page: number,
    limit: number,
    search?: string,
    sortOrder?: "asc" | "desc",
    skill?: string,
    expertise?: string
  ): Promise<{ data: IInstructor[]; total: number }>;

  getMentorInstructorById(id: string): Promise<IInstructor | null>;

  getAvailableSkillsAndExpertise(): Promise<{
    skills: string[];
    expertise: string[];
  }>;
}
