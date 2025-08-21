import { IInstructorProfileService } from "../instructorServices/interfaces/IInstructorProfileService";
import { IInstructorProfileRepository } from "../../repositories/instructorRepository/interfaces/IInstructorProfileRepository";
import { IInstructor } from "../../models/instructor.Model";

export class InstructorProfileService implements IInstructorProfileService {
  private instructorProfileRepo: IInstructorProfileRepository;

  constructor(instructorProfileRepo: IInstructorProfileRepository) {
    this.instructorProfileRepo = instructorProfileRepo;
  }

  async getProfile(email: string): Promise<IInstructor | null> {
    return await this.instructorProfileRepo.getByEmail(email);
  }

  async updateProfile(id: string, data: Partial<IInstructor>): Promise<IInstructor | null> {
    return await this.instructorProfileRepo.updateProfile(id, data);
  }

  async updatePassword(email: string, password: string): Promise<boolean> {
    const updated = await this.instructorProfileRepo.updatePassword(email, password);
    return !!updated;
  }
}
