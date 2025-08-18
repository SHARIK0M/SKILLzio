import { IUser } from '../../../models/user.Model'
import { IAdmin } from '../../../models/admin.Model'
import { IInstructor } from '../../../models/instructor.Model'
export interface IAdminRepository {
  //admin login
  getAdmin(email: string): Promise<IAdmin | null>
  createAdmin(adminData: IAdmin): Promise<IAdmin | null>

  //fetch users and instructors

  getAllUsers(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ users: IUser[]; total: number }>
  getAllInstructors(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ instructors: IInstructor[]; total: number }>

  //get data based on email
  getUserData(email: string): Promise<IUser | null>
  getInstructorData(email: string): Promise<IInstructor | null>

  //block and ublock
  updateProfile(email: String, data: any): Promise<any>
  updateInstructorProfile(email: string, data: any): Promise<any>
}
