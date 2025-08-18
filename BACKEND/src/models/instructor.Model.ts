import mongoose , {Document, ObjectId, Schema } from "mongoose";

export interface IInstructorDTO{
    username : string,
    email : string,
    password : string
}

export interface IInstructor extends Document{
    _id:ObjectId,
    username:string,
    email:string,
    password:string,
    mobileNo:string,
    profilePicUrl:string,
    role:string,
    isVerified:boolean,
    isBlocked:boolean,
    isMentor:boolean,
    skills?:string[],
    expertise?:string[]
    memberShipValidTill:Date,
}

const instructorSchema: Schema<IInstructor> = new Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobileNo:{
        type:String,
        required:false
    },
    profilePicUrl:{
        type:String,
        required:false
    },
    role:{
        type:String,
        enum:["instructor","mentor"],
        required:false,
        default:"instructor"
    },
    isVerified:{
        type:Boolean,
        required:false,
        default:false
    },
    isBlocked:{
        type:Boolean,
        required:false,
        default:false
    },
    isMentor:{
        type:Boolean,
        required:false,
        default:false
    },
    memberShipValidTill:{
        type:Date,
        required:false
    },
    skills:{
        type:[String],default:[]
    },
    expertise:{
        type:[String],default:[]
    }
},{timestamps:true})

const InstructorModel = mongoose.model<IInstructor>("Instructors",instructorSchema)

export default InstructorModel