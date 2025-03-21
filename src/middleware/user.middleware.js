import mongoose from "mongoose";
import { apiErrorResponse } from "../utils/helpers.js";

export const validateAddUser = (req,res,next) => {
    const {name,email,password,role,createdBy,assignedTo} = req.body;
    if(!createdBy) {
        return apiErrorResponse(res,400,'Admin id is required.');
    }
    if(createdBy && !mongoose.isValidObjectId(createdBy)) {
        return apiErrorResponse(res,400,'Invalid admin id.');
    }
    
    if(!name) {
        return apiErrorResponse(res,400,'Name is required.');
    }
    if(!email) {
        return apiErrorResponse(res,400,'Email is required.');
    }
    if(!password) {
        return apiErrorResponse(res,400,'Password is required.');
    }
    if(!role) {
        return apiErrorResponse(res,400,'Role is required.');
    }
    next();
}