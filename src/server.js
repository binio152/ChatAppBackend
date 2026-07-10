import express from "express";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import friendRoute from "./routes/friendRoute.js";
import messageRoute from "./routes/messageRoute.js";
import conversationRoute from "./routes/conversationRoute.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { protectedRoute } from "./middlewares/authMiddleware.js";
import cors from "cors";
import { app, server } from "./socket/index.js";

export const allowOrigins = [
  process.env.CLIENT_URL ?? "http://localhost:5173",
  "http://192.168.1.5:5173",
  "http://192.168.16.1:5173",
  "http://192.168.126.1:5173",
  "http://192.168.1.2:5173",
  "192.168.1.2:5173",
];

// middlewares
app.use(
  cors({
    origin: allowOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// public routes
app.use("/api/auth", authRoute);

// testing root
app.get("/test", (req, res) => {
  res.send("Server is running ...");
});

// private routes
app.use(protectedRoute);
app.use("/api/users", userRoute);
app.use("/api/friends", friendRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);

export { app };
export default app;
