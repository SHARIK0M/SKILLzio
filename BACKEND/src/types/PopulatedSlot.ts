import { ISlot } from "../models/slot.Model";

import { IInstructor } from "../models/instructor.Model"; 

export type PopulatedSlot = ISlot & {
  instructorId: IInstructor;
};