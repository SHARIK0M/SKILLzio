import { IInstructorMembershipOrder, InstructorMembershipOrderModel } from "../../models/instructorMembershipOrder.Model";
import { GenericRepository } from "./generic.Repository";

export class InstructorMembershipOrder extends GenericRepository<IInstructorMembershipOrder>{
    constructor(){
        super(InstructorMembershipOrderModel)
    }
}