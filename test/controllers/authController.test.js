import { describe, expect, vi, beforeEach, test } from "vitest";
import { signUp } from "../../src/controllers/authController.js";
import request from "supertest";
import server from "../../src/server.js";
import User from "../../src/models/User.js";
import Session from "../../src/models/Session.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  mockCreateAccessToken,
  mockCreatedUserSuccessful,
  mockCreateRefreshToken,
  mockCreatedUser,
  mockCreatedSession,
  mockDBError,
  mockExistingUser,
  mockHashedPassword,
  mockNotExistingUser,
  mockPasswordMatch,
  mockPasswordMissMatch,
} from "./mockAuthController.js";

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
    mockNotExistingUser(User);
    mockHashedPassword();
    mockCreatedUser(User);

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

describe("authController.signIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should sign in successfully", async () => {
    mockExistingUser(User);
    mockPasswordMatch();
    mockCreateAccessToken();
    mockCreateRefreshToken();
    mockCreatedSession(Session);

    const account = { username: "username", password: "123456" };
    const res = await request(server).post("/api/auth/signin").send(account);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/signed in successfully/i);
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toBe(
      "refresh-token=refresh-token; Path=/; HttpOnly; Secure; SameSite=None",
    );
  });

  test("should returns 400 when missing required fields", async () => {
    const res = await request(server).post("/api/auth/signin").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/missing required fields/i);
  });

  test("should returns 401 when account not exists", async () => {
    mockNotExistingUser(User);

    const res = await request(server)
      .post("/api/auth/signin")
      .send({ username: "username", password: "password" });

    console.log(res);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid username or password/i);
  });

  test("should returns 401 with miss matched password", async () => {
    mockExistingUser(User);
    mockPasswordMissMatch();

    const res = await request(server)
      .post("/api/auth/signin")
      .send({ username: "username", password: "password" });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid username or password/i);
  });

  test("should return 500 on server error", async () => {
    mockDBError(User);

    const res = await request(server)
      .post("/api/auth/signin")
      .send({ username: "username", password: "password" });

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/internal server error/i);
  });
});
