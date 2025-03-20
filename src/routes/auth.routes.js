import express from 'express';
import { validateLoginAdmin } from '../middleware/admin.middlware.js';
import { login } from '../controller/auth/auth.controller.js';
const router = express.Router();
router.post("/login",validateLoginAdmin,login)
export default router;