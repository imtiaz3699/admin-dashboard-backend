import Admin from "../models/admin.model.js";
import { apiErrorResponse, apiSuccessResponse } from "../utils/helpers.js";
import jwt from "jsonwebtoken";
export const addAdmin = async (req, res) => {
  try {
    const admin = await Admin(req.body);
    await admin.save();
    const obj = admin.toObject();
    delete obj.password;
    return apiSuccessResponse(res, 200, "Admin added successfully", obj);
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, `Something went wrong ${e.message}`);
  }
};

export const updateAdmin = async (req, res) => {
  const adminId = req.params.id;
  try {
    const admin = await Admin.findByIdAndUpdate(adminId, req.body, {
      new: true,
    });
    return apiSuccessResponse(res, 200, "Admin updated successfully", admin);
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, "Something went wrong.");
  }
};

export const deleteAdmin = async (req, res) => {
  const adminId = req.params.id;
  try {
    const admin = await Admin.findByIdAndDelete(adminId);
    if(!admin) {
      return apiErrorResponse(res, 400, "Admin not found.");
    }
    return apiSuccessResponse(res, 200, "Admin deleted successfully", admin);
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, "Something went wrong.");
  }
};

export const getAllAdmins = async (req, res) => {
  const { page = 1, limit = 10, adminId } = req.query;
  try {
    if (adminId) {
      const admin = await Admin.findById(adminId).select("-password");
      return apiSuccessResponse(res, 200, "Admin fetched successfully", admin);
    } else {
      const admins = await Admin.find({ createdBy: req.user._id })
        .populate("createdBy", "-password")
        .select("-password")
        .skip((page - 1) * limit)
        .limit(limit);
      const totalRecords = await Admin.countDocuments({
        createdBy: req.user._id,
      });
      const data = {
        admins,
        pagination: {
          totalRecords,
          page,
          limit,
        },
      };
      return apiSuccessResponse(res, 200, "Admins fetched successfully", data);
    }
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, "Something went wrong.");
  }
};