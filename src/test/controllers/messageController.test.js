import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  findConversationSpy,
  fakeConversation,
  fakeMessage,
  fakeMessageWithoutConversationId,
  messageSpy,
  mockResponse,
  createConversationSpy,
  fakeMessageWithoutId,
} from "./mockMessageController.js";
import { sendDirectMessage } from "../../controllers/messageController.js";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import { updateConversationAfterCreateMessage } from "../../utils/messageHelper.js";

describe("messageController.sendDirectMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return 400 when content is empty", async () => {
    const req = {
      body: { recipientId: "user2", content: "" },
      user: { _id: "user1" },
    };
    const res = mockResponse();

    await sendDirectMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Message content is required",
    });
  });

  test("should send message to existing conversation", async () => {
    const req = {
      body: {
        conversationId: "conversation1",
        recipientId: "user2",
        content: "Hello",
      },
      user: { _id: "user1" },
    };
    const res = mockResponse();
    const conversation = { ...fakeConversation };

    findConversationSpy(Conversation).mockResolvedValue(conversation);
    messageSpy(Message).mockResolvedValue(fakeMessage);

    await sendDirectMessage(req, res);

    expect(Conversation.findById).toHaveBeenCalledWith(
      fakeMessage.conversationId,
    );
    expect(Message.create).toHaveBeenCalledWith(fakeMessageWithoutId);

    expect(conversation.set).toHaveBeenCalledWith({
      seenBy: [],
      lastMessageAt: conversation.createdAt,
      lastMessage: {
        _id: fakeMessage._id,
        content: fakeMessage.content,
        senderId: req.user._id,
        createdAt: conversation.createdAt,
      },
    });

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("should create new conversation and send message", async () => {
    const req = {
      body: {
        recipientId: "user2",
        content: "Hello",
      },
      user: { _id: "user1" },
    };
    const res = mockResponse();
    const conversation = { ...fakeConversation };

    createConversationSpy(Conversation).mockResolvedValue(conversation);
    messageSpy(Message).mockResolvedValue(fakeMessage);

    await sendDirectMessage(req, res);

    expect(Conversation.create).toHaveBeenCalledWith({
      type: "direct",
      participants: [
        {
          userId: req.user._id,
          joinedAt: expect.any(Date),
        },
        {
          userId: req.body.recipientId,
          joinedAt: expect.any(Date),
        },
      ],
      lastMessageAt: expect.any(Date),
      unreadCounts: expect.any(Map),
    });

    expect(Message.create).toHaveBeenCalledWith(fakeMessageWithoutId);

    expect(conversation.set).toHaveBeenCalledWith({
      seenBy: [],
      lastMessageAt: conversation.createdAt,
      lastMessage: {
        _id: fakeMessage._id,
        content: fakeMessage.content,
        senderId: req.user._id,
        createdAt: conversation.createdAt,
      },
    });

    expect(conversation.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({ message: fakeMessage, conversation });
  });
});
