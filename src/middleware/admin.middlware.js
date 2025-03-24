import mongoose from "mongoose";
import { apiErrorResponse, apiSuccessResponse } from "../utils/helpers.js";
import Admin from "../models/admin.model.js";

export const validateAdmin = async (req, res, next) => {
  const { name, email, password, role,createdBy } = req.body;
  if (!name) {
    return apiErrorResponse(res, 400, "Name is required.");
  }
  if (!email) {
    return apiErrorResponse(res, 400, "email is required");
  }
  if (!password) {
    return apiErrorResponse(res, 400, "Password is required.");
  }
  if(!createdBy) {
    return apiErrorResponse(res, 400, "Admin id is required.");
  }
  const adminExists = await Admin.findOne({ email });
  if (adminExists) {
    return apiErrorResponse(res, 400, "Admin with this email already exists.");
  }
  if(!mongoose.isValidObjectId(createdBy)) {
    return apiErrorResponse(res, 400, "Invalid admin id.");
  }
  const validRole = ["super_admin", "admin"];
  if (role && !validRole.includes(role)) {
    return apiErrorResponse(res, 400, "Invalid role.");
  }
  next();
};
export const validateAdminUpdate = async (req, res, next) => {
  if (!req.params.id) {
    return apiErrorResponse(res, 400, "Admin id is required.");
  }
  const isValid = mongoose.isValidObjectId(req.params.id);
  if (!isValid) {
    return apiErrorResponse(res, 400, "Invalid admin id.");
  }
  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    return apiErrorResponse(res, 400, "Admin not found.");
  }
  next();
};
export const validateAdminDelete = (req, res, next) => {
  if (!req.params.id) {
    return apiErrorResponse(res, 400, "Admin id is required.");
  }
  const isValid = mongoose.isValidObjectId(req.params.id);
  if (!isValid) {
    return apiErrorResponse(res, 400, "Invalid admin id.");
  }
  if (req.user.role !== "super_admin") {
    return apiErrorResponse(res, 400, "Only super admin can delete admin.");
  }
  next();
};

export const validateGetAdmin = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    return apiErrorResponse(res, 400, "Only super admin can get admin.");
  }
  next();
};

export const validateLoginAdmin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email) {
    return apiErrorResponse(res, 400, "Email is required.");
  }
  if (!password) {
    return apiErrorResponse(res, 400, "Password is required.");
  }
  next()
};
