import express from "express";
import adminRoutes from './admin.routes.js'
import authRoutes from './auth.routes.js';
import managerRoutes from './manager.routes.js';
import taskRoutes from './task.routes.js';
import userRouters from './user.routes.js'
const router = express.Router();
router.use("/admin",adminRoutes)
router.use("/auth",authRoutes);
router.use("/manager",managerRoutes);
router.use("/task",taskRoutes);
router.use("/user",userRouters);
export default router;

