import { Router } from "express";
import {
  findByUsername,
  getProfile,
  updateProfile,
  uploadAvatar,
} from "../controllers/userController.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.get("/find", findByUsername);
router.post("/upload/avatar", upload.single("file"), uploadAvatar);

export default router;
