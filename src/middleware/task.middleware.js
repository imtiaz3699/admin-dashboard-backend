import mongoose from "mongoose";
import { apiErrorResponse, apiSuccessResponse } from "../utils/helpers.js";

export const validateAddTask = async (req, res, next) => {
  const { title, due_date, status, priority, createdBy, assignedTo } = req.body;
  const dueDate = new Date(due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!title) {
    return apiErrorResponse(res, 400, "Title is required.");
  }

  if (dueDate <= today) {
    return apiErrorResponse(res, 400, "Due date must be a future date.");
  }
  if(!createdBy) {
    return apiErrorResponse(res, 400, "Created by is required.");
  }
  if (createdBy && !mongoose.isValidObjectId(createdBy)) {
    return apiErrorResponse(res, 400, "Created by id is not valid.");
  }
  if(!due_date) {
    return apiErrorResponse(res, 400, "Due date is required.");
  }
  if (assignedTo && !mongoose.isValidObjectId(assignedTo)) {
    return apiErrorResponse(res, 400, "Assigned by is not valid.");
  }
  next();
};
export const validateUpdateTask = (req, res, next) => {
  const { title, due_date, assignedTo, assignedBy } = req.body;
  const taskId = req.params.id;
  const dueDate = new Date(due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!mongoose.isValidObjectId(taskId)) {
    return apiSuccessResponse(res, 400, "Invalid task id.");
  }
  if (assignedBy && !mongoose.isValidObjectId(assignedBy)) {
    return apiErrorResponse(res, 400, "Assigned by id is not valid.");
  }
  if (assignedTo && !mongoose.isValidObjectId(assignedTo)) {
    return apiErrorResponse(res, 400, "Assigned to id is not valid.");
  }
  if (!title) {
    return apiErrorResponse(res, 400, "Title is required.");
  }
  if (!due_date) {
    return apiErrorResponse(res, 400, "Due date is required.");
  }
  if (dueDate <= today) {
    return apiErrorResponse(res, 400, "Due date must be a future date.");
  }
  next();
};

export const validateDeleteTask = (req, res, next) => {
    const taskId = req.params.id;
    console.log(req.user.role)
    if (
    req.user.role !== "admin" &&
    req.user.role !== "super_admin" &&
    req.user.role !== "manager"
  ) {
    return apiErrorResponse(res, 400, "User cannot delete a task.");
  }
  if (!mongoose.isValidObjectId(taskId)) {
    return apiErrorResponse(res, 400, "Invalid task id.");
  }
  next();
};
