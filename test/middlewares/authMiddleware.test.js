import { describe, test, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import User from "../../src/models/User.js";
import { protectedRoute } from "../../src/middlewares/authMiddleware.js";
import {
  mockCreatedJWTFail,
  mockCreatedJWTSuccessful,
  mockResponse,
  mockUserExists,
  mockUserNotFound,
  next,
} from "./mockAuthMiddleware.js";

vi.mock("../../src/models/User.js");

describe("authMiddleware.protectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should authenticate user successfully", async () => {
    const req = { headers: { authorization: "Bearer token" } };
    const res = mockResponse();

    mockCreatedJWTSuccessful();
    mockUserExists(User); // return { _id:1, username: "username" }

    await protectedRoute(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ _id: 1 });
  });

  test("should return 401 when token is missing", async () => {
    const req = {
      headers: {},
    };
    const res = mockResponse();

    await protectedRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should returns 403 when token is invalid", async () => {
    const req = {
      headers: {
        authorization: "Bearer token",
      },
    };
    const res = mockResponse();
    mockCreatedJWTFail();

    await protectedRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("should return 404 when user does not exists", async () => {
    const req = {
      headers: {
        authorization: "Bearer token",
      },
    };
    const res = mockResponse();
    mockCreatedJWTSuccessful();
    mockUserNotFound(User);

    await protectedRoute(req, res, next);
    console.log({ res, req });

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
