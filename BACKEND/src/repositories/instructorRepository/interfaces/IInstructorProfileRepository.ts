import { IInstructor } from "../../../models/instructor.Model";

export interface IInstructorProfileRepository {
  getByEmail(email: string): Promise<IInstructor | null>;
  updateProfile(id: string, data: Partial<IInstructor>): Promise<IInstructor | null>;
  updatePassword(email: string, hashedPassword: string): Promise<IInstructor | null>;
}