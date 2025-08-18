import { IUser } from '../../../models/user.Model'
import { IAdmin, IAdminDTO } from '../../../models/admin.Model'
import { IInstructor } from '../../../models/instructor.Model'

export interface IAdminService {
  getAdminData(email: string): Promise<IAdmin | null>
  createAdmin(adminData: IAdminDTO): Promise<IAdmin | null>

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

  //specified data based on email
  getUserData(email: string): Promise<IUser | null>
  getInstructorData(email: string): Promise<IInstructor | null>

  //block or unblock
  updateProfile(email: string, data: any): Promise<any>
  updateInstructorProfile(email: string, data: any): Promise<any>
}