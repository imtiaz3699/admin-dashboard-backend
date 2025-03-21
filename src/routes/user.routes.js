import express from "express";
import { addUser, deleteUser, getAllUser, updateUser } from "../controller/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateAddUser, validateDeleteUser, validateGetUser, validateUpdateUser } from "../middleware/user.middleware.js";

const router= express.Router();
router.post("/add-router",authMiddleware,validateAddUser, addUser)
router.get("/get-users",authMiddleware,validateGetUser, getAllUser)
router.put("/update-user/:id",authMiddleware,validateUpdateUser, updateUser);
router.delete("/delete-user/:id",authMiddleware,validateDeleteUser, deleteUser);
export default router;