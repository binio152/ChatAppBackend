import { Router } from "express";
import { checkFriendship } from "../middlewares/messageMiddleware.js";
import {
  createConversation,
  getConversation,
  getMessage,
} from "../controllers/conversationController.js";

const router = Router();

router.get("/:conversationId", getConversation);
router.get("/:conversationId/messages", getMessage);

router.post("/", checkFriendship, createConversation);

export default router;
