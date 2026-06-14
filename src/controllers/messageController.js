import Conversation from "../models/Conversation";
import Message from "../models/Message";

export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, conversationId } = req.body;
    const senderId = req.user._id;

    let conversation;

    if (!content)
      return res.status(400).json({ message: "Message content is required" });

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
        ],
        lastMessageAt: new Date(),
        unreadCount: new Map(),
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
    });
  } catch (err) {
    console.log("Error occurred while getting user send direct message", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
  } catch (err) {
    console.log("Error occurred while getting user send group message", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
