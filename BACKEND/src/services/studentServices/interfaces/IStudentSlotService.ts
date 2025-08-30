import { ISlot } from "../../../models/slot.Model";

export interface IStudentSlotService {
  getAvailableSlots(instructorId: string): Promise<ISlot[]>;
}
