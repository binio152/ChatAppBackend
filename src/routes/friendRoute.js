import { Router } from "express";
import {
  acceptFriendRequest,
  cancelFriendRequest,
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
router.post("/requests/:requestId/cancel", cancelFriendRequest);

export default router;
