import { Router } from "express";
import { checkFriendship } from "../middlewares/messageMiddleware.js";
import {
  createConversation,
  getConversation,
  getMessage,
  markAsSeen,
} from "../controllers/conversationController.js";

const router = Router();

router.get("/", getConversation);
router.get("/:conversationId/messages", getMessage);

router.post("/", checkFriendship, createConversation);

router.patch("/:conversationId/seen", markAsSeen);

export default router;
