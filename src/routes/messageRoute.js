import { Router } from "express";
import {
  sendDirectMessage,
  sendGroupMessage,
} from "../controllers/messageController.js";
import { checkFriendship } from "../middlewares/friendMiddleware.js";

const router = Router();

router.post("/direct", checkFriendship, sendDirectMessage);
router.post("/group", sendGroupMessage);

export default router;
