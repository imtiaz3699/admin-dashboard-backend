import mongoose from "mongoose";
import { apiErrorResponse } from "../utils/helpers.js";

export const validateAddUser = (req, res, next) => {
  const { name, email, password, role, createdBy, assignedTo } = req.body;
  if (!createdBy) {
    return apiErrorResponse(res, 400, "Admin id is required.");
  }
  if (createdBy && !mongoose.isValidObjectId(createdBy)) {
    return apiErrorResponse(res, 400, "Invalid admin id.");
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
  if (!role) {
    return apiErrorResponse(res, 400, "Role is required.");
  }
  next();
};
export const validateGetUser = (req, res, next) => {
  if (
    req.user.role !== "admin" &&
    req.user.role !== "super_admin" &&
    req.user.role !== "manager"
  ) {
    return apiErrorResponse(res, 400, "Only admin can get user.");
  } else {
    next();
  }
};

export const validateUpdateUser = (req, res, next) => {
  const { name, email, password, role, assignedTo } = req.body;
  const userId = req.params.id;

  if (!mongoose.isValidObjectId(userId)) {
    return apiErrorResponse(res, 400, "Invalid user id.");
  }
  if (!email) {
    return apiErrorResponse(res, 400, "Email is required.");
  }
  if (!password) {
    return apiErrorResponse(res, 400, "Password is required.");
  }
  next();
};

export const validateDeleteUser = (req, res, next) => {
  const userId = req.params.id;
  if (!req.user.role === "admin" && req.user.role === "super_admin") {
    return apiErrorResponse(res, 400, "Only admin can update user.");
  }
  if (!mongoose.isValidObjectId(userId)) {
    return apiErrorResponse(res, 400, "Invalid user id.");
  }
  next();
};
