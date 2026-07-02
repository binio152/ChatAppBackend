import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";

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

    if (!conversationId) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
        ],
        lastMessageAt: new Date(),
        unreadCounts: new Map(),
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    return res.status(201).json({ message });
  } catch (err) {
    console.log("Error occurred while getting user send direct message", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    if (!content)
      return res.status(400).json({ message: "Missing message content" });

    const message = await Message.create({ conversationId, senderId, content });
    updateConversationAfterCreateMessage(conversation, message, senderId);

    return res.status(201).json({ message });
  } catch (err) {
    console.log("Error occurred while getting user send group message", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
