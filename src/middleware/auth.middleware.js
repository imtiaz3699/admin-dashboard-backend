import jwt from "jsonwebtoken";
import { apiErrorResponse } from "../utils/helpers.js";

export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied, no token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "super_admin") {
    next();
    return;
  } else {
    return apiErrorResponse(res, 400, "Only admin can access this route.");
  }
};

export const superAdminMiddleware = (req, res, next) => {
  if (req.user.role === "super_admin") {
    next();
    return;
  } else {
    return apiErrorResponse(
      res,
      400,
      "Only super admin can access this route."
    );
  }
};
