import express from "express";
import { addUser } from "../controller/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateAddUser } from "../middleware/user.middleware.js";

const router= express.Router();
router.post("/add-router",authMiddleware,validateAddUser, addUser)
export default router;