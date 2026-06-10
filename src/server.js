import express from "express";
import authRoute from "./routes/authRoute.js";

const server = express();

server.use(express.json());

// public routes
server.use("/api/auth", authRoute);

// private routes

// testing root
server.get("/test", (req, res) => {
  res.send("Server is running ...");
});

export { server };
export default server;
