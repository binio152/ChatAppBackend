import { Router } from "express";
import { findByUsername, getProfile } from "../controllers/userController.js";

const router = Router();

router.get("/profile", getProfile);
router.get("/find", findByUsername);

export default router;
