import Admin from "./admin.services.js";
import jwt from "jsonwebtoken";
export const getAdminByEmail = async (email) => {
  try {
    const admin = await Admin.findOne({ email });
    if (admin) {
      return admin;
    } else {
      return null;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
};


