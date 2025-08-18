import  {IOtp}  from "../../../models/otp.Model";

export default interface IOtpServices{
    findOtp(email:string):Promise<IOtp | null>
    deleteOtp(email:string):Promise<IOtp | null>
    createOtp(email:string,otp:string):Promise<IOtp | null>
}