import Manager from "../models/manager.model.js";
import { apiErrorResponse, apiSuccessResponse } from "../utils/helpers.js";
import mongoose from "mongoose";
export const validateManager = (req, res, next) => {
  const { name, email, password, createdBy } = req.body;

  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return apiErrorResponse(res, 400, "Only admin can add manager.");
  }
  
  if (!name) {
    return apiErrorResponse(res, 400, "Name is required.");
  }
  if (!email) {
    return apiErrorResponse(res, 400, "Email is required.");
  }
  if (!password) {
    return apiErrorResponse(res, 400, "Password is required.");
  }
  if (!createdBy) {
    return apiErrorResponse(res, 400, "Admin id is required.");
  }
  if (!mongoose.isValidObjectId(createdBy)) {
    return apiErrorResponse(res, 400, "Invalid admin id.");
  }
  next();
};

export const validateUpdateManager = (req, res, next) => {
  const { name, email, password, createdBy } = req.body;
  const managerId = req.params.id;
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return apiErrorResponse(res, 400, "Only admin can add manager.");
  }
  if (!managerId) {
    return apiErrorResponse(res, 400, "Manager id is required.");
  }
  if (!mongoose.isValidObjectId(managerId)) {
    return apiErrorResponse(res, 400, "Invalid manager id.");
  }
  if (!name) {
    return apiErrorResponse(res, 400, "Name is required.");
  }
  if (!email) {
    return apiErrorResponse(res, 400, "Email is required.");
  }
  next();
};
export const validateGetManagers = async (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return apiErrorResponse(res, 400, "Only admin can get manager.");
  }
  next();
};

export const validateDeleteManager = async (req, res, next) => {
  const managerId = req.params.id;
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return apiErrorResponse(res, 400, "Only admin can delete manager.");
  }
  if (!mongoose.isValidObjectId(managerId)) {
    return apiSuccessResponse(res, 400, "Invalid manager id.");
  }
  next();
};

export const validateLoginManager = (req,res,next) => {
    const {email,password} = req.body;
    if(!email) {
        return apiErrorResponse(res, 400, "Email is required.");    
    }
    if(!password) {
        return apiErrorResponse(res, 400, "Password is required.");    
    }
    next();
}