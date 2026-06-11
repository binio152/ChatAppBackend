import { Router } from "express";
import {
  signUp,
  signIn,
  signOut,
  refresh,
} from "../controllers/authController.js";

const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.post("/refresh", refresh);

export default router;
