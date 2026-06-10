import { Router } from "express";
import { signUp, signIn } from "../controllers/authController.js";

const router = Router();

router.post("/signUp", signUp);

router.post("/signin", signIn);

export default router;
