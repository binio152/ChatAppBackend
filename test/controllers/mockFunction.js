import { vi } from "vitest";
import bcrypt from "bcrypt";

vi.mock("bcrypt");

export const mockHashedPassword = () => {
  vi.mocked(bcrypt.genSalt).mockResolvedValue("ganeratedSalt");
  vi.mocked(bcrypt.hash).mockResolvedValue("hashedPassword");
};

export const mockNotDupplicateUser = (User) => {
  User.findOne.mockResolvedValue(null);
};

export const mockCreatedUserSuccessful = (User) => {
  User.create.mockResolvedValue({
    username: "username",
    email: "test@gmail.com",
    displayname: "A B",
  });
};

export const mockExistingUser = (User) => {
  User.findOne.mockResolvedValue({ usernme: "username" });
};

export const mockDBError = (User) => {
  User.findOne.mockRejectedValue(new Error("DB error"));
};
