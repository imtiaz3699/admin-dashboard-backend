import User from "../models/user.models.js";
import { apiErrorResponse,apiSuccessResponse } from "../utils/helpers.js";

export const addUser = async (req, res) => {
  const { name, email, password, role, createdBy, assignedTo } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return apiErrorResponse(res, 400, "User with this email already exists.");
    }
    const user = await User({
      name,
      email,
      password,
      role,
      createdBy,
      assignedTo,
    });
    await user.save();
    return apiSuccessResponse(res, 200, "User added successfully.",user);
  } catch (e) {
    console.log(e);
    return apiErrorResponse(res, 500, "Something went wrong.");
  }
};

export const getAllUser = async (req,res) => {
    try {
        const users = await User.find();
    }catch (e) {
        console.log(e.message);
        return apiErrorResponse(res, 500, `Something went wrong.${e.message}`);
    }
}