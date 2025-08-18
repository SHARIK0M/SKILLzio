import { IVerificationModel } from "../../models/verification.Model";
import { GenericRepository } from "../genericRepo/genericRepository"; 
import VerificationModel from "../../models/verification.Model";
import { IInstructorVerificationRepository } from "./interfaces/IInstructorVerifcationRepository"; 

export class InstructorVerificationRepository extends GenericRepository<IVerificationModel> implements IInstructorVerificationRepository {
    constructor() {
        super(VerificationModel);
    }

    async sendVerifyRequest(username: string, email: string, degreeCertificateUrl: string, resumeUrl: string, status: string): Promise<IVerificationModel | null> {
        try {
            return await this.create({ username, email, degreeCertificateUrl, resumeUrl, status });
        } catch (error) {
            throw error;
        }
    }

    async getRequestByEmail(email: string): Promise<IVerificationModel | null> {
    try {
      return await this.findOne({ email });
    } catch (error) {
    throw error;
  }
}

async updateRequestByEmail(email: string, update: Partial<IVerificationModel>): Promise<IVerificationModel | null> {
    return await VerificationModel.findOneAndUpdate({email},{$set:update},{new:true})
}
}