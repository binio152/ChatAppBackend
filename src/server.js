import express from "express";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { protectedRoute } from "./middlewares/authMiddleware.js";
import cors from "cors";
const server = express();

const allowOrigins = [
  process.env.CLIENT_URL ?? "http://localhost:5173",
  "http://192.168.1.5:5173/",
  "http://192.168.16.1:5173/",
  "http://192.168.126.1:5173/",
  "http://192.168.1.5:5173/",
];
// middlewares
server.use(
  cors({
    origin: allowOrigins,

    credentials: true,
  }),
);
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());
server.use(morgan("dev"));

// public routes
server.use("/api/auth", authRoute);

// private routes
server.use(protectedRoute);
server.use("/api/", userRoute);

// testing root
server.get("/test", (req, res) => {
  res.send("Server is running ...");
});

export { server };
export default server;
