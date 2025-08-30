import { IStudentInstructorListingService } from "./interfaces/IStudentInstructorListingService";
import { IStudentInstructorListingRepository } from "../../repositories/studentRepository/interfaces/IStudentInstructorListingRepository"; 
import { IInstructor } from "../../models/instructor.Model";
import { getPresignedUrl } from "../../utils/getPresignedUrl";

export class StudentInstructorListingService
  implements IStudentInstructorListingService
{
  private instructorListingRepo: IStudentInstructorListingRepository;

  constructor(repo: IStudentInstructorListingRepository) {
    this.instructorListingRepo = repo;
  }

  async getPaginatedMentors(
  page: number,
  limit: number,
  search?: string,
  sortOrder?: "asc" | "desc",
  skill?: string,
  expertise?: string
): Promise<{ data: IInstructor[]; total: number }> {
  const { data, total } =
    await this.instructorListingRepo.listMentorInstructorsPaginated(
      page,
      limit,
      search,
      sortOrder,
      skill,
      expertise
    );

  const updatedData = await Promise.all(
    data.map(async (mentor) => {
      if (mentor.profilePicUrl) {
        mentor.profilePicUrl = await getPresignedUrl(mentor.profilePicUrl);
      }
      return mentor;
    })
  );

  return { data: updatedData as IInstructor[], total };
}


  async getMentorById(id: string): Promise<IInstructor | null> {
    const mentor = await this.instructorListingRepo.getMentorInstructorById(id);
    if (!mentor) return null;

    const mentorObj = mentor.toObject();
    if (mentor.profilePicUrl) {
      mentorObj.profilePicUrl = await getPresignedUrl(mentor.profilePicUrl);
    }
    return mentorObj as IInstructor;
  }

  async getAvailableFilters(): Promise<{ skills: string[]; expertise: string[] }> {
  return await this.instructorListingRepo.getAvailableSkillsAndExpertise();
}

}
