import Admin from "../../models/admin.model.js";
import { apiErrorResponse,apiSuccessResponse } from "../../utils/helpers.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return apiErrorResponse(res, 400, "Admin not found.");
      }
      const isMatch = await admin.matchPassword(password);
      if (!isMatch) {
        return apiErrorResponse(res, 400, "Invalid credentials.");
      }
      const token = jwt.sign(
        {
          _id: admin?._id,
          name: admin?.name,
          email: admin?.email,
          role: admin?.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      const obj = admin.toObject();
      delete obj.password;
      return apiSuccessResponse(res, 200, "Admin logged in successfully", {token,user:obj});
    } catch (e) {
      console.log(e);
      return apiErrorResponse(res, 500, "Something went wrong.");
    }
  };