import { IUser } from "../../models/user.Model";
import IStudentService from "./interfaces/IStudentService"; 
import { IStudentRepository } from "../../repositories/studentRepository/interfaces/IStudentRepository"; 

export class StudentServices implements IStudentService {
    private studentRepository: IStudentRepository;

    constructor(studentRepository: IStudentRepository) {
        this.studentRepository = studentRepository;
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await this.studentRepository.findByEmail(email);
    }

    async createUser(userData: IUser): Promise<IUser | null> {
        return await this.studentRepository.create(userData)
    }

    async resetPassword(email: string, password: string): Promise<IUser | null> {
        return await this.studentRepository.resetPasswrod(email,password)
    }

    async googleLogin(name: string, email: string): Promise<IUser | null> {
        return await this.studentRepository.googleLogin(name,email)
    }
}