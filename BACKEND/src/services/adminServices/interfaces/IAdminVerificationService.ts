import { IVerificationModel } from "../../../models/verification.Model";

export interface IAdminVerificationService {
  getAllRequests(page: number, limit: number, search?: string): Promise<{ data: IVerificationModel[]; total: number }>;

  getRequestDataByEmail(email: string): Promise<IVerificationModel | null>;
  
  approveRequest(email: string, status: string,reason?:string): Promise<IVerificationModel | null>;
}
