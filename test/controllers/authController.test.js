import { describe, expect, vi, beforeEach, test } from "vitest";
import { signUp } from "../../src/controllers/authController.js";
import User from "../../src/models/User.js";
import bcrypt from "bcrypt";
import request from "supertest";
import server from "../../src/server.js";
import {
  mockCreatedUserSuccessful,
  mockDBError,
  mockExistingUser,
  mockHashedPassword,
  mockNotDupplicateUser,
} from "./mockFunction.js";

vi.mock("../../src/models/User.js");
vi.mock("bcrypt");

const createdUser = (fields) => ({
  username: "username",
  password: "123456789",
  email: "test@gmail.com",
  firstName: "A",
  lastName: "B",
  ...fields,
});

describe("authController.signUp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should create user successfully", async () => {
    mockNotDupplicateUser(User);
    mockHashedPassword();
    mockCreatedUserSuccessful(User);

    const res = await request(server)
      .post("/api/auth/signUp")
      .send(createdUser({ username: "username" }));

    expect(res.status).toBe(201);
    expect(res.body.newUser.username).toBe("username");
    expect(res.body.newUser.email).toBe("test@gmail.com");
  });

  test("should returns 400 when missing required fields", async () => {
    const res = await request(server).post("/api/auth/signUp").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Missing required fields/);
  });

  test("should returns 409 when username exists", async () => {
    mockExistingUser(User); // return { usernme: "username" }

    const res = await request(server)
      .post("/api/auth/signUp")
      .send(createdUser());

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/username already exists/i);
  });

  test("should return 500 on server error", async () => {
    mockDBError(User);

    const res = await request(server)
      .post("/api/auth/signUp")
      .send(createdUser());

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/internal server error/i);
  });
});
