import { IVerificationModel } from "../../../models/verification.Model";

export interface IInstructorVerificationService {
  sendVerifyRequest(username: string, email: string, degreeCertificateUrl: string, resumeUrl: string, status: string): Promise<IVerificationModel>;

  getRequestByEmail(email:string):Promise<IVerificationModel | null>

  reverifyRequest(username:string,email:string,degreeCertificateUrl:string,resumeUrl:string):Promise<IVerificationModel>
}
