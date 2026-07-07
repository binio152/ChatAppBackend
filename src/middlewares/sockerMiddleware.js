import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized - Missing token"));

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) return next(new Error("Invalid or expired token"));

    const user = await User.findById(decoded.userId).select("-hashedPassword");
    if (!user) return next(new Error("User is not exists"));

    socket.user = user;
    next();
  } catch (err) {
    console.loh("Error occurred while verifying jwt in socket middleware");
    next(new Error("Unauthorized"));
  }
};
