import { vi } from "vitest";
import bcrypt from "bcrypt";
import crypto from "crypto";
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
  vi.spyOn(jwt, "sign").mockReturnValue("access-token");
};

export const mockCreateRefreshToken = () => {
  vi.spyOn(crypto, "randomBytes").mockReturnValue(Buffer.from("refresh-token"));
};

export const mockCreatedSession = (Session) => {
  vi.spyOn(Session, "create").mockResolvedValue({
    _id: "session-id",
  });
};
