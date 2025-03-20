import express from "express";
import { addManager, deleteManager, getAllManagers, loginManager, updateManager } from "../controller/manager.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateDeleteManager, validateGetManagers, validateLoginManager, validateManager, validateUpdateManager } from "../middleware/manager.middleware.js";

const router = express.Router();
router.post("/add-manager",authMiddleware,validateManager,addManager)
router.put("/update-manager/:id",authMiddleware,validateUpdateManager,updateManager);
router.get("/get-managers",authMiddleware,validateGetManagers,getAllManagers)
router.delete("/delete-manager/:id",authMiddleware,validateDeleteManager,deleteManager)
router.post("/login-manager",validateLoginManager,loginManager)
export default router