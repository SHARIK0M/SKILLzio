import { IStudentProfileService } from './interfaces/IStudentProfileService'
import { IStudentProfileRepository } from '../../repositories/studentRepository/interfaces/IStudentProfileRepository'
import {IUser} from '../../models/user.Model'

export class StudentProfileService implements IStudentProfileService{
    private studentProfileRepository : IStudentProfileRepository

    constructor(studentProfileRepository:IStudentProfileRepository){
        this.studentProfileRepository = studentProfileRepository
    }

    async getProfile(email: string): Promise<IUser | null> {
        return await this.studentProfileRepository.getByEmail(email)
    }

    async updateProfile(id: string, data: Partial<IUser>): Promise<IUser | null> {
        return await this.studentProfileRepository.updateProfile(id,data)
    }

    async updatePassword(email: string, password: string): Promise<boolean> {
        const updated = await this.studentProfileRepository.updatePassword(email,password)
        return !!updated
    }
}