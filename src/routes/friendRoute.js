import { Router } from "express";
import {
  acceptFriendRequest,
  declineFriendRequest,
  getFriendLists,
  getFriendRequestLists,
  sendFriendRequest,
} from "../controllers/friendController.js";

const router = Router();

router.get("/lists", getFriendLists);
router.get("/requests", getFriendRequestLists);

router.post("/requests", sendFriendRequest);
router.post("/requests/:requestId/accept", acceptFriendRequest);
router.post("/requests/:requestId/decline", declineFriendRequest);

export default router;
