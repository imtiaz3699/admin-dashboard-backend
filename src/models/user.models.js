import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default:"user"
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admin"
    },
    assignedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Manager"
    }
},{timestamps:true})
export default User = mongoose.model("User",userSchema);