import { IAdminVerificationService } from "./interfaces/IAdminVerificationService"; 
import { IVerificationModel } from "../../models/verification.Model";
import { IAdminVerificationRepository } from "../../repositories/adminRepository/interfaces/IAdminVerificationRepository"; 
import IInstructorService from "../instructorServices/interfaces/IInstructorService"; 

export class AdminVerificationService implements IAdminVerificationService {
  private verificationRepository: IAdminVerificationRepository;
  private instructorService:IInstructorService;

  constructor(verificationRepository: IAdminVerificationRepository,instructorService:IInstructorService) {
    this.verificationRepository = verificationRepository;
    this.instructorService = instructorService
  }

  async getAllRequests(page: number, limit: number, search = ''): Promise<{ data: IVerificationModel[]; total: number }> {
  return await this.verificationRepository.getAllRequests(page, limit, search);
  }


  async getRequestDataByEmail(email: string): Promise<IVerificationModel | null> {
    return await this.verificationRepository.getRequestDataByEmail(email);
  }

  async approveRequest(email: string, status: string,reason?:string): Promise<IVerificationModel | null> {
    try {
      const result = await this.verificationRepository.approveRequest(email,status,reason)

      if(result && status === 'approved'){
        await this.instructorService.setInstructorVerified(email)
      }

      return result
    } catch (error) {
      throw error
    }
  }
}
