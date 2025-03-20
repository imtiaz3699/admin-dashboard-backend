import express from "express";
import adminRoutes from './admin.routes.js'
import authRoutes from './auth.routes.js';
const router = express.Router();
router.use("/admin",adminRoutes)
router.use("/auth",authRoutes);
export default router;

