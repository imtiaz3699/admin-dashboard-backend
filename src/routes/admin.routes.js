import express from "express";
import {
  addAdmin,
  deleteAdmin,
  getAllAdmins,
  updateAdmin,
} from "../controller/admin.controller.js";
import {
  validateAdmin,
  validateAdminDelete,
  validateAdminUpdate,
} from "../middleware/admin.middlware.js";
import {
  authMiddleware,
  adminMiddleware,
  superAdminMiddleware,
} from "../middleware/auth.middleware.js";
const router = express.Router();
router.post("/add-admin", validateAdmin, addAdmin);
router.put(
  "/update-admin/:id",
  authMiddleware,
  adminMiddleware,
  validateAdminUpdate,
  updateAdmin
);
router.get(
  "/get-all-admins",
  authMiddleware,
  superAdminMiddleware,
  getAllAdmins
);
router.delete(
  "/delete-admin/:id",
  authMiddleware,
  validateAdminDelete,
  deleteAdmin
);
export default router;
