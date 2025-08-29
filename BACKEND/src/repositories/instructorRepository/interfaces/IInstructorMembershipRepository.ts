import { IMembershipPlan } from "../../../models/membershipPlan.Model";

export interface IInstructorMembershipRepository {
  getActivePlans(): Promise<IMembershipPlan[]>;
  findById(id: string): Promise<IMembershipPlan | null>;
}
