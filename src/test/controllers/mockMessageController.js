import { vi } from "vitest";

export const mockResponse = () => {
  const res = {};

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);

  return res;
};

export const fakeConversation = {
  _id: "conversation1",
  participants: [
    {
      userId: "user1",
      joinedAt: new Date(),
    },
    {
      userId: "user2",
      joinedAt: new Date(),
    },
  ],
  group: { name: "abc", createdBy: "user1" },
  lastMessageAt: new Date(),
  unreadCounts: new Map(),
  save: vi.fn().mockResolvedValue(),
  set: vi.fn((data) => Object.assign(this, data)),
};

export const fakeMessage = {
  _id: "message1",
  conversationId: "conversation1",
  senderId: "user1",
  content: "Hello",
};

export const fakeMessageWithoutId = {
  conversationId: "conversation1",
  senderId: "user1",
  content: "Hello",
};

export const findConversationSpy = (Conversation) =>
  vi.spyOn(Conversation, "findById");

export const createConversationSpy = (Conversation) =>
  vi.spyOn(Conversation, "create");

export const messageSpy = (Message) => vi.spyOn(Message, "create");
