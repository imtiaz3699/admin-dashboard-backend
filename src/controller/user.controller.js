import User from "../models/user.models.js";
import { apiErrorResponse, apiSuccessResponse } from "../utils/helpers.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
export const addUser = async (req, res) => {
  const { name, email, password, role, createdBy, assignedTo } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return apiErrorResponse(res, 400, "User with this email already exists.");
    }
    const user = await User(req.body);
    
    await user.save();
    const obj = user.toObject();
    delete obj.password;
    return apiSuccessResponse(res, 200, "User added successfully.", obj);
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, "Something went wrong.");
  }
};

export const updateUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return apiErrorResponse(res, 400, "User not found.");
    }
    if(req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password,10);
    }
    await user.updateOne(req.body);
    const obj = user.toObject();    
    delete obj.password;
    return apiSuccessResponse(res, 200, "User updated successfully.", obj);
  } catch (e) {
    console.log(e);
    return apiSuccessResponse(res, 400, `Something went wrong.${e.message}`);
  }
};

export const getAllUser = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  let query = {};
  if (req?.user?.role === "admin") {
    query = {
      createdBy: req?.user?._id,
    };
  }
  if (req?.user?.role === "manager") {
    query = {
      assignedTo: req?.user?._id,
    };
  }
  try {
    const users = await User.find(query)
      .select("-password -isDeleted")
      .populate("createdBy", "-password")
      .populate("assignedTo", "-password")
      .skip((page - 1) * limit);
    const totalRecords = await User.countDocuments(query);
    const data = {
      data: users,
      pagination: {
        totalRecords: totalRecords,
        page,
        limit,
      },
    };

    return apiSuccessResponse(res, 200, "Users fetched successfully.", data);
  } catch (e) {
    console.log(e.message);
    return apiErrorResponse(res, 500, `Something went wrong.${e.message}`);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if(user?.isDeleted) {
      return apiErrorResponse(res, 400, "User not found.");
    }
    if (!user) {
      return apiErrorResponse(res, 400, "User not found.");
    }
    await user.updateOne({ isDeleted: true });
    return apiSuccessResponse(res, 200, "User deleted successfully.");
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, `Something went wrong.${e.message}`);
  }
};
