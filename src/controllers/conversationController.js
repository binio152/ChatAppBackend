import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { io } from "../socket/index.js";

export const createConversation = async (req, res) => {
  try {
    const { type, memberIds, name } = req.body;
    console.log({ type, memberIds, name });
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

    const participants = conversation.participants.map((p) => ({
      _id: p.userId?.id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    }));
    const formatted = {
      ...conversation.toObject(),
      unreadCounts: conversation.unreadCounts ?? {},
      participants,
    };

    if (type === "group") {
      memberIds.forEach((member) => {
        io.to(member).emit("new-group", formatted);
      });
    }

    res.status(200).json({ conversation: formatted });
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

export const getUserConversationsForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find(
      { "participants.userId": userId },
      { _id: 1 },
    );

    return conversations.map((c) => c._id.toString());
  } catch (err) {
    console.log("Error occurred while getting conversations");
    return [];
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation)
      return res.status(404).json({ message: "Conversation is not exists" });

    const lastMessage = conversation.lastMessage;
    if (!lastMessage)
      return res.status(404).json({ message: "Last message not found" });

    if (lastMessage.senderId.toString() === userId)
      return res.status(200).json({ message: "Message is from the same user" });

    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: { seenBy: req.user._id },
        $set: { [`unreadCounts.${userId}`]: 0 },
      },
      {
        new: true,
      },
    );

    io.to(conversationId).emit("read-message", {
      conversation: updated,
      lastMessage: {
        _id: updated?.lastMessage._id,
        content: updated?.lastMessage.content,
        createdAt: updated?.lastMessage.createdAt,
        sender: {
          _id: updated?.lastMessage.senderId,
        },
      },
    });

    return res.status(200).json({
      message: "Mark as seen",
      seenBy: updated?.seenBy || [],
      myUnreadCounts: updated?.unreadCounts[userId] || 0,
    });
  } catch (err) {
    console.log("Error occurred while marking as seen");
    return res.status(500).json({ message: "Internal server error" });
  }
};
