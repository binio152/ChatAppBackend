import express from "express";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { protectedRoute } from "./middlewares/authMiddleware.js";

const server = express();

// middlewares
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
