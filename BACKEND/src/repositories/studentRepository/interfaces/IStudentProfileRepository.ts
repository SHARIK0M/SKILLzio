import { IUser } from "../../../models/user.Model";

export interface IStudentProfileRepository{
    getByEmail(email:string):Promise<IUser|null>
    updateProfile(id:string,data:Partial<IUser>):Promise<IUser|null>
    updatePassword(email:string,hashedPassword:string):Promise<IUser|null>
}