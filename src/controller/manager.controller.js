import Manager from "../models/manager.model.js";
import { apiErrorResponse, apiSuccessResponse } from "../utils/helpers.js";

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
    const managerExists = await Manager.findByIdAndUpdate(managerId, req.body, {
      new: true,
    });
    if (!managerExists) {
      return apiErrorResponse(res, 400, "Manager not found.");
    }
    return apiSuccessResponse(
      res,
      200,
      "Manager updated successfully",
      managerExists
    );
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, "Something went wrong.");
  }
};

export const getAllManagers = async (req, res) => {
  const { page = 1, limit = 10,managerId } = req.query;

  try {
    if(managerId) {
        const manager = await 
    }
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
    return apiSuccessResponse(res, 200, "Managers fetched successfully", data);
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
    return apiSuccessResponse(res,500,'Something went wrong.')
  }
};

