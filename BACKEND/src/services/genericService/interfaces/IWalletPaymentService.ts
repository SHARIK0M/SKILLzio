import { IWallet } from "../../../models/wallet.Model";

export interface IWalletPaymentService {
  createOrder(amount: number): Promise<any>;
  verifyAndCreditWallet(details: {
    orderId: string;
    paymentId: string;
    signature: string;
    amount: number;
    userId: string;
    role: 'student' | 'instructor' | 'admin';    
    onModel: 'User' | 'Instructor' | 'Admin';     
  }): Promise<IWallet>;
}
