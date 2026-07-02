import Conversation from "../models/Conversation.js";
import Friend from "../models/Friend.js";

const pair = (a, b) => (a.toString() < b.toString() ? [a, b] : [b, a]);

export const checkFriendship = async (req, res, next) => {
  try {
    const senderId = req?.user._id;

    const recipientId = req.body?.recipientId ?? null;
    if (!recipientId)
      return res.status(400).json({ message: "Recipiend id is not provided" });

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
  } catch (err) {
    console.log("Error occurred while checking friendship", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
