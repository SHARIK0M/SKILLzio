
export interface IEmail {
  sentEmailVerification(name: string, email: string, verification: string): Promise<boolean>

}

export interface IForgotEmail {
  sendEmailVerification(email: string, verification: string): Promise<boolean>
}
