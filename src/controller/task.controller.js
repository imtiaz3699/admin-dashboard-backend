import Task from "../models/task.model.js";
import { apiErrorResponse, apiSuccessResponse } from "../utils/helpers.js";

export const addTask = async (req, res) => {
  try {
    const task = await Task(req.body);
    await task.save();
    return apiSuccessResponse(res, 200, "Task added successfully.", task);
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, `Something went wrong.${e.message}`);
  }
};

export const updateTask = async (req, res) => {
  const taskId = req.params.id;
  let query = { _id: taskId };
  if (req.user.role === "manager") {
    query = {
      _id: taskId,
      assignedBy: req.user._id,
    };
  }
  if (req.user.role === "user") {
    query = {
      _id: taskId,
      assignedTo: req.user._id,
    };
  }
  try {
    const task = await Task.findOneAndUpdate(query, req.body, { new: true });
    if (!task) {
      return apiErrorResponse(res, 400, "Task not found.");
    }
    return apiSuccessResponse(res, 200, "Task updated successfully.", task);
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, `Something went wrong.${e.message}`);
  }
};

export const getAllTask = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  let query = {};
  if (req.user.role === "manager") {
    query = {
      createdBy: req.user._id,
    };
  }
  if (req.user.role === "user") {
    query = {
      assignedTo: req.user._id,
    };
  }
  try {
    const tasks = await Task.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "-password");
    const totalRecords = await Task.countDocuments(query);
    const data = {
      data: tasks,
      pagination: {
        totalRecords: totalRecords,
        page,
        limit,
      },
    };
    return apiSuccessResponse(res, 200, "Tasks fetched successfully.", data);
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, `Something went wrong.${e.message}`);
  }
};

export const deleteTask = async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await Task.findByIdAndDelete({ _id: taskId });
    if (!task) {
      return apiErrorResponse(res, 400, "Task not found.");
    }
    return apiSuccessResponse(res, 200, "Task deleted successfully.");
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, `Something went wrong.${e.message}`);
  }
};
