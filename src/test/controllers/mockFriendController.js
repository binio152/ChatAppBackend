import { vi } from "vitest";

export const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);

  return res;
};

export const mockExistingUser = (User) => {
  vi.spyOn(User, "exists").mockResolvedValue({
    _id: "user1",
    displayName: "user1",
    avatarUrl: "img1",
  });
};

export const mockFindUserSuccessful = (User) => {
  vi.spyOn(User, "findById").mockReturnValue({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockReturnValue({
        _id: "user1",
        displayName: "user1",
        avatarUrl: "img1",
      }),
    }),
  });
};

export const mockUnexistingUser = (User) => {
  vi.spyOn(User, "exists").mockResolvedValue(null);
};

export const mockAlreadyFriends = (Friend) => {
  vi.spyOn(Friend, "findOne").mockResolvedValue({ _id: "friendship1" });
};

export const mockNotFriends = (Friend) => {
  vi.spyOn(Friend, "findOne").mockResolvedValue(null);
};

export const mockExistingRequest = (FriendRequest) => {
  vi.spyOn(FriendRequest, "findOne").mockResolvedValue({
    _id: "request1",
    from: "user1",
    to: "user2",
  });
};

export const mockUnexistingRequest = (FriendRequest) => {
  vi.spyOn(FriendRequest, "findOne").mockResolvedValue(null);
};

export const mockDeleteRequest = (FriendRequest) => {
  vi.spyOn(FriendRequest, "findByIdAndDelete").mockResolvedValue(true);
};

export const mockCreateRequest = (FriendRequest) => {
  vi.spyOn(FriendRequest, "create").mockResolvedValue({
    message: "Send friend request successfully!",
    request: { _id: "request_1", from: "user1", to: "user2" },
  });
};

export const mockCreateFriend = (Friend) => {
  vi.spyOn(Friend, "create").mockResolvedValue({});
};
