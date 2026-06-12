import { vi } from "vitest";
import bcrypt from "bcrypt";
import crypto, { randomBytes } from "crypto";
import jwt from "jsonwebtoken";

export const mockHashedPassword = () => {
  bcrypt.genSalt = vi.fn().mockResolvedValue("ganeratedSalt");
  bcrypt.hash = vi.fn().mockResolvedValue("hashedPassword");
};

export const mockNotExistingUser = (User) => {
  vi.spyOn(User, "findOne").mockResolvedValue(null);
};

export const mockExistingUser = (User) => {
  vi.spyOn(User, "findOne").mockResolvedValue({
    _id: "123",
    username: "username",
    hashedPassword: "hashedPassword",
  });
};

export const mockDBError = (User) => {
  vi.spyOn(User, "findOne").mockRejectedValue(new Error("DB error"));
};

export const mockCreatedUser = (User) => {
  vi.spyOn(User, "create").mockResolvedValue({
    username: "username",
    email: "test@gmail.com",
    displayname: "A B",
  });
};

export const mockPasswordMatch = () => {
  vi.spyOn(bcrypt, "compare").mockResolvedValue(true);
};

export const mockPasswordMissMatch = () => {
  vi.spyOn(bcrypt, "compare").mockResolvedValue(false);
};

export const mockCreateAccessToken = () => {
  vi.spyOn(jwt, "sign").mockReturnValue("accessToken");
};

export const mockCreateRefreshToken = () => {
  vi.spyOn(crypto, "randomBytes").mockReturnValue({
    toString: () => "refreshToken",
  });
};

export const mockCreatedSession = (Session) => {
  vi.spyOn(Session, "create").mockResolvedValue({
    _id: "sessionId",
    refreshToken: "refreshToken",
    expiresAt: new Date(Date.now() + 1000 * 60),
  });
};

export const mockExistingSession = (Session) => {
  vi.spyOn(Session, "findOne").mockResolvedValue({
    _id: "sessionId",
    refreshToken: "refreshToken",
    expiresAt: new Date(Date.now() + 1000 * 60),
  });
};

export const mockExpiredSession = (Session) => {
  vi.spyOn(Session, "findOne").mockResolvedValue({
    _id: "sessionId",
    refreshToken: "refreshToken",
    expiresAt: new Date(Date.now() - 1000 * 60),
  });
};

export const mockNotExistingSession = (Session) => {
  vi.spyOn(Session, "findOne").mockResolvedValue(null);
};

export const mockResponse = () => {
  const res = {};

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);

  res.sendStatus = vi.fn();
  res.clearCookie = vi.fn();

  return res;
};

export const mockDeletedSession = (Session) => {
  vi.spyOn(Session, "deleteOne").mockResolvedValue({
    deleteCount: 1,
  });
};
