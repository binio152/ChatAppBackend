import { vi } from "vitest";
import jwt from "jsonwebtoken";

export const mockResponse = () => {
  const res = {};

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);

  return res;
};

export const next = vi.fn();

export const mockCreatedJWTSuccessful = () => {
  vi.spyOn(jwt, "verify").mockReturnValue({
    userId: "userId",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 100),
  });
};

export const mockCreatedJWTFail = () => {
  vi.spyOn(jwt, "verify").mockImplementation(() => {
    const err = new Error("Invalid token");
    err.name = "JsonWebTokenError";
    throw err;
  });
};

export const mockUserNotFound = (User) => {
  vi.spyOn(User, "findById").mockReturnValue({
    select: vi.fn().mockResolvedValue(null),
  });
};

export const mockUserExists = (User) => {
  vi.spyOn(User, "findById").mockReturnValue({
    select: vi.fn().mockResolvedValue({
      _id: 1,
      username: "username",
    }),
  });
};
