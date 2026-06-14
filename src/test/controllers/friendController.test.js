import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  mockAlreadyFriends,
  mockCreateFriend,
  mockCreateRequest,
  mockDeleteRequest,
  mockExistingRequest,
  mockExistingUser,
  mockFindUserSuccessful,
  mockNotFriends,
  mockResponse,
  mockToStringMethod,
  mockUnexistingRequest,
  mockUnexistingUser,
} from "./mockFriendController";
import {
  acceptFriendRequest,
  declineFriendRequest,
  sendFriendRequest,
} from "../../controllers/friendController";
import User from "../../models/User.js";
import Friend from "../../models/Friend.js";
import FriendRequest from "../../models/FriendRequest.js";

const createRequest = ({ from, to }) => {
  return {
    body: { to: to, message: "hello" },
    user: { _id: from },
  };
};

describe("friendController.sendFriendRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return 400 when send request to myseft", async () => {
    const req = createRequest({ from: "user1", to: "user1" });
    const res = mockResponse();

    await sendFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cannot send request to yourself",
    });
  });

  test("should return 404 when send request to unexisting user", async () => {
    const req = createRequest({ from: "user1", to: "___" });
    const res = mockResponse();

    mockUnexistingUser(User);

    await sendFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cannot send request to unexisting user",
    });
    expect(User.exists).toHaveBeenCalledWith({ _id: "___" });
  });

  test("should return 400 id users are already friends", async () => {
    const req = createRequest({ from: "user1", to: "user2" });
    const res = mockResponse();

    mockExistingUser(User);
    mockAlreadyFriends(Friend);
    mockUnexistingRequest(FriendRequest);

    const response = await sendFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are already friends",
    });
  });

  test("should return 400 if friend request already exists", async () => {
    const req = createRequest({ from: "user1", to: "user2" });
    const res = mockResponse();

    mockExistingUser(User);
    mockNotFriends(Friend);
    mockExistingRequest(FriendRequest);

    const response = await sendFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Friend request already sent",
    });
  });

  test("should send friend request successfully", async () => {
    const req = createRequest({ from: "user1", to: "user2" });
    const res = mockResponse();

    mockExistingUser(User);
    mockNotFriends(Friend);
    mockUnexistingRequest(FriendRequest);
    mockCreateRequest(FriendRequest);

    await sendFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("friendController.acceptFriendRequest", () => {
  test("should return 404 when send request is not found", async () => {
    const req = {
      params: { requestId: "request1" },
      user: { _id: "user1" },
    };
    const res = mockResponse();

    mockUnexistingRequest(FriendRequest);

    await acceptFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Friend request not found",
    });
  });

  test("should return 403 when user do not have recipience", async () => {
    const req = {
      params: { requestId: "request1" },
      user: { _id: "___" },
    };
    const res = mockResponse();

    mockExistingRequest(FriendRequest);
    await acceptFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not the recipient of this request",
    });
  });

  test("should accept request successfully", async () => {
    const req = {
      params: { requestId: "request1" },
      user: { _id: "user2" },
    };
    const res = mockResponse();

    mockExistingRequest(FriendRequest);
    mockCreateFriend(Friend);
    mockDeleteRequest(FriendRequest);
    mockFindUserSuccessful(User);

    await acceptFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("friendController.declineFriendRequest", () => {
  test("should return 404 when send request is not found", async () => {
    const req = {
      params: { requestId: "request1" },
      user: { _id: "user1" },
    };
    const res = mockResponse();

    mockUnexistingRequest(FriendRequest);

    await declineFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Friend request not found",
    });
  });

  test("should return 403 when user do not have recipience", async () => {
    const req = {
      params: { requestId: "request1" },
      user: { _id: "___" },
    };
    const res = mockResponse();

    mockExistingRequest(FriendRequest);
    await declineFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not the recipient of this request",
    });
  });

  test("should accept request successfully", async () => {
    const req = {
      params: { requestId: "request1" },
      user: { _id: "user2" },
    };
    const res = mockResponse();

    mockExistingRequest(FriendRequest);
    mockCreateFriend(Friend);
    mockDeleteRequest(FriendRequest);

    await declineFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
