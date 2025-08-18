import { IInstructor } from "../../models/instructor.Model";
import IInstructorRepository from "../../repositories/instructorRepository/interfaces/IInstructorRepository"; 
import IInstructorService from "./interfaces/IInstructorService"; 

export default class InstructorService implements IInstructorService{
    private instructorRepository : IInstructorRepository

    constructor(instructorRepository:IInstructorRepository){
        this.instructorRepository = instructorRepository
    }

    async findByEmail(email: string): Promise<IInstructor | null> {
        return this.instructorRepository.findByEmail(email)
    }

    async createUser(userData:IInstructor): Promise<IInstructor | null> {
        return this.instructorRepository.createUser(userData)
    }

    async resetPassword(email: string, password: string): Promise<IInstructor | null> {
        return this.instructorRepository.resetPassword(email,password)
    }

    async googleLogin(name: string, email: string): Promise<IInstructor | null> {
        return this.instructorRepository.googleLogin(name,email)
    }

    async setInstructorVerified(email:string):Promise<IInstructor | null>{
        return this.instructorRepository.updateByEmail(email,{isVerified:true})
    }
}