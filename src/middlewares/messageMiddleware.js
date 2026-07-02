import Conversation from "../models/Conversation.js";
import Friend from "../models/Friend.js";
import User from "../models/User.js";

const pair = (a, b) => (a.toString() < b.toString() ? [a, b] : [b, a]);

export const checkFriendship = async (req, res, next) => {
  try {
    const senderId = req?.user._id;
    const memberIds = req.body?.memberIds ?? [];

    const recipientId = req.body?.recipientId ?? null;
    if (!recipientId && memberIds.length === 0)
      return res
        .status(400)
        .json({ message: "Recipient id or member ids is not provided" });

    if (recipientId) {
      const [userA, userB] = pair(senderId, recipientId);

      const isFriend = await Friend.findOne({ userA, userB });
      if (!isFriend)
        return res.status(403).json({
          message:
            "Friendship required. Please send a friend request to interact",
        });

      return next();
    }

    const isFriendChecks = memberIds.map(async (memberId) => {
      const [userA, userB] = pair(senderId, memberId);

      const friend = await Friend.findOne({ userA, userB });
      if (!friend) {
        const notFriendUser = await User.findById(memberId).select(
          "_id displayName avatarUrl",
        );
        return notFriendUser;
      }

      return null;
    });

    const result = await Promise.all(isFriendChecks);
    const notFriends = result.filter(Boolean);

    if (notFriends.length > 0) {
      return res.status(403).json({
        message:
          "You can only add users who are in your friend list to this group.",
        notFriends,
      });
    }

    next();
  } catch (err) {
    console.log("Error occurred while checking friendship", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkGroupMembership = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const senderId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Conversation is not exists" });

    const isMember = conversation.participants.some(
      (p) => p.userId.toString() === senderId.toString(),
    );
    if (!isMember)
      return res
        .status(403)
        .json({ message: "You are not participant in this group" });

    req.conversation = conversation;
    next();
  } catch (err) {
    console.log("Error occurred while checking group membership", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
