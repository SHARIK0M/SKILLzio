import { Types } from 'mongoose';
import { IWallet } from '../../../models/wallet.Model';

export interface IWalletService {
  getWallet(ownerId: Types.ObjectId): Promise<IWallet | null>;
  creditWallet(ownerId: Types.ObjectId, amount: number, description: string, txnId: string): Promise<IWallet | null>;
  debitWallet(ownerId: string|Types.ObjectId, amount: number, description: string, txnId: string): Promise<IWallet | null>;
  initializeWallet(ownerId: Types.ObjectId, onModel: string, role: string): Promise<IWallet>;
  creditAdminWalletByEmail(email:string,amount:number,description:string,tnxId:string):Promise<void>
  getPaginatedTransactions(ownerId: Types.ObjectId, page: number, limit: number): Promise<{ transactions: IWallet["transactions"], total: number }>
  getAdminWalletByEmail(email: string): Promise<IWallet | null>;
}