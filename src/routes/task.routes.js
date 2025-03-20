import express from "express";
import { validateAddTask, validateDeleteTask, validateUpdateTask } from "../middleware/task.middleware.js";
import { addTask, deleteTask, getAllTask, updateTask } from "../controller/task.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";


const router = express.Router();
router.post("/add-task",authMiddleware,validateAddTask,addTask)
router.put("/update-task/:id",authMiddleware,validateUpdateTask,updateTask)
router.get("/get-task",authMiddleware,getAllTask)
router.delete("/delete-task/:id",authMiddleware,validateDeleteTask,deleteTask);
export default router;