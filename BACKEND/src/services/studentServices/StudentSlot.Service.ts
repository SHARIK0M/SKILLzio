import { ISlot } from "../../models/slot.Model";
import { IStudentSlotRepository } from "../../repositories/studentRepository/interfaces/IStudentSlotRepository"; 
import { IStudentSlotService } from "./interfaces/IStudentSlotService"; 

export class StudentSlotService implements IStudentSlotService {
  private slotRepo: IStudentSlotRepository;

  constructor(repo: IStudentSlotRepository) {
    this.slotRepo = repo;
  }

  async getAvailableSlots(instructorId: string): Promise<ISlot[]> {
    return await this.slotRepo.getAvailableSlotsByInstructorId(instructorId);
  }
}
