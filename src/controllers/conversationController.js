import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body;
    const userId = req.user._id;

    if (
      !type ||
      (type === "group" && !name) ||
      !memberIds ||
      !Array.isArray(memberIds) ||
      memberIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Group name and participants are required" });
    }

    let conversation;

    if (type === "direct") {
      const participantId = memberIds[0];

      conversation = await Conversation.findOne({
        type: "direct",
        "participants.userId": { $all: [userId, participantId] },
      });

      if (!conversation) {
        conversation = new Conversation({
          type: "direct",
          participants: [{ userId }, { userId: participantId }],
          lastMessageAt: new Date(),
        });

        await conversation.save();
      }
    }

    if (type === "group") {
      conversation = await Conversation.findOne({
        type: "group",
        group: {
          name,
          createdBy: userId,
        },
        "participants.userId": { $all: [userId, ...memberIds] },
      });

      if (!conversation) {
        conversation = new Conversation({
          type: "group",
          participants: [
            { userId },
            ...memberIds.map((id) => ({ userId: id })),
          ],
          group: {
            name,
            createdBy: userId,
          },
          lastMessageAt: new Date(),
        });

        await conversation.save();
      }
    }

    if (!conversation) {
      return res.status(400).json({ message: "Conversation type is invalid" });
    }

    await conversation.populate([
      { path: "participants.userId", select: "displayName avatarUrl" },
      { path: "seenBy", select: "displayName avatarUrl" },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    return res.status(201).json({ conversation });
  } catch (err) {
    console.log("Error occurred while creating conversation", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      "participants.userId": userId,
    })
      .sort({ lastMessageAt: -1, updatedAt: 1 })
      .populate({
        path: "participants.userId",
        select: "_id displayName avatarUrl",
      })
      .populate({
        path: "lastMessage.senderId",
        select: "_id displayName avatarUrl",
      })
      .populate({
        path: "seenBy",
        select: "_id displayName avatarUrl",
      });

    const formatted = conversations.map((conversation) => {
      const participants = conversation.participants.map((p) => ({
        _id: p.userId?.id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      }));

      return {
        ...conversation.toObject(),
        unreadCounts: conversation.unreadCounts ?? {},
        participants,
      };
    });

    res.status(200).json({ conversations: formatted });
  } catch (err) {
    console.log("Error occurred while getting conversation", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;

    const query = { conversationId };
    if (cursor) query.createdAt = { $lt: new Date(cursor) };

    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1);

    let nextCursor = null;
    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1];
      nextCursor = nextMessage.createdAt.toISOString();
      messages.pop();
    }

    messages = messages.reverse();
    return res.status(200).json({ messages, nextCursor });
  } catch (err) {
    console.log("Error occurred while getting all messages");
    return res.status(500).json({ message: "Internal server error" });
  }
};
