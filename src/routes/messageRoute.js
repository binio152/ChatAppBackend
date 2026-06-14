import { Router } from "express";
import {
  sendDirectMessage,
  sendGroupMessage,
} from "../controllers/messageController";

const router = Router();

router.post("/direct", sendDirectMessage);
router.post("/group", sendGroupMessage);

export default router;
