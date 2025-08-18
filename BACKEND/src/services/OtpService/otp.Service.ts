import { IOtp } from "../../models/otp.Model";
import IOtpRepository from "../../repositories/otpRepository/interfaces/IOtpRepository"; 
import IOtpServices from "../instructorServices/interfaces/IOtpService"; 

export class OtpService implements IOtpServices{
    private otpRepository : IOtpRepository
    constructor(otpRepository:IOtpRepository){
        this.otpRepository = otpRepository
    }

    async createOtp(email: string, otp: string): Promise<IOtp | null> {
        try{
            const response = await this.otpRepository.createOtp(email,otp)
            return response
        }catch(error){
            throw error
        }
    }

    async findOtp(email:string):Promise<IOtp | null>{
        try {
            const response = await this.otpRepository.findOtp(email)
            return response
        } catch (error) {
            throw error
        }
    }

    async deleteOtp(email: string): Promise<IOtp | null> {
        try {
            const response = await this.otpRepository.deleteOtp(email)
            return response
        } catch (error) {
            throw error
        }
    }
}