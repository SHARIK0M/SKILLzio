import { IInstructor } from "../../../models/instructor.Model";
import { IMembershipPlan } from "../../../models/membershipPlan.Model"; 

export interface IInstructorMembershipService {
  getAvailablePlans(): Promise<IMembershipPlan[]>;
  getInstructorById(instructorId: string): Promise<IInstructor | null>;
  getMembershipStatus(instructorId: string): Promise<{
  planId: string | null;
  expiryDate: Date | null;
  isMentor: boolean;
}>;

}
