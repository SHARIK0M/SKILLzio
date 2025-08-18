import { IInstructor } from "../../../models/instructor.Model";

export interface IAdminInstructorRepository{
    getAllInstructors(page: number, limit: number, search: string):Promise<{instructors:IInstructor[];total:number}>

//get data based on email
    getInstructorData(email:string):Promise<IInstructor | null>

//block and unblock
    updateInstructorProfile(email:string,data:any):Promise<any>
}