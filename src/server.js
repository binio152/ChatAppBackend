import express from "express";
import authRoute from "./routes/authRoute.js";
import morgan from "morgan";

const server = express();

// middlewares
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(morgan("dev"));

// public routes
server.use("/api/auth", authRoute);

// private routes

// testing root
server.get("/test", (req, res) => {
  res.send("Server is running ...");
});

export { server };
export default server;
