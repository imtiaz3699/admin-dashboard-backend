import Manager from "../models/manager.model.js";
import { apiErrorResponse, apiSuccessResponse } from "../utils/helpers.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
export const addManager = async (req, res) => {
  try {
    const managerExists = await Manager.findOne({ email: req.body.email });
    if (managerExists) {
      return apiErrorResponse(
        res,
        400,
        "Manager with this email already exists."
      );
    }
    const manager = await Manager(req.body);
    await manager.save();
    const obj = manager.toObject();
    delete obj.password;
    return apiSuccessResponse(res, 200, "Manager added successfully", obj);
  } catch (e) {
    console.log(e);
  }
};

export const updateManager = async (req, res) => {
  const managerId = req.params.id;
  try {
    const manager = await Manager.findOne({
      _id: managerId,
      createdBy: req.user._id,
    });
    if (!manager) {
      return apiErrorResponse(res, 400, "Manager not found.");
    }
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    await manager.updateOne(req.body);
    const obj = manager.toObject();
    delete obj.password;
    return apiSuccessResponse(res, 200, "Manager updated successfully.", obj);
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, "Something went wrong.");
  }
};

export const getAllManagers = async (req, res) => {
  const { page = 1, limit = 10, managerId } = req.query;
  try {
    if (managerId) {
      const manager = await Manager.findById(managerId)
        .populate("createdBy -password")
        .select("-password");
      return apiSuccessResponse(
        res,
        200,
        "Manager fetched successfully",
        manager
      );
    } else {
      const managers = await Manager.find({ createdBy: req.user._id })
        .populate("createdBy", "-password")
        .select("-password")
        .skip((page - 1) * limit)
        .limit(limit);
      const totalRecords = await Manager.countDocuments({
        createdBy: req.user._id,
      });
      const data = {
        data: managers,
        pagination: {
          totalRecords,
          page,
          limit,
        },
      };
      return apiSuccessResponse(
        res,
        200,
        "Managers fetched successfully",
        data
      );
    }
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, "Something went wrong.");
  }
};

export const deleteManager = async (req, res) => {
  const managerId = req.params.id;
  try {
    const manager = await Manager.findOne({
      createdBy: req.user._id,
      _id: managerId,
    });
    if (!manager) {
      return apiErrorResponse(res, 400, "Manager not found.");
    }
    await manager.deleteOne();
    return apiSuccessResponse(res, 200, "Manager deleted successfully");
  } catch (e) {
    console.log(e);
    return apiSuccessResponse(res, 500, "Something went wrong.");
  }
};

export const loginManager = async (req, res) => {
  const { email, password } = req.body;
  try {
    const manager = await Manager.findOne({ email });
    if (!manager) {
      return apiErrorResponse(res, 400, "Manager not found.");
    }
    const isMatch = await manager.matchPassword(password);
    if (!isMatch) {
      return apiErrorResponse(res, 400, "Invalid credentials.");
    }
    const token = jwt.sign(
      {
        _id: manager?._id,
        name: manager?.name,
        email: manager?.email,
        createdBy: manager?.createdBy,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    const obj = manager.toObject();
    delete obj.password;
    return apiSuccessResponse(res, 200, "Manager logged in successfully", {
      token,
      user: obj,
    });
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, "Something went wrong.");
  }
};
