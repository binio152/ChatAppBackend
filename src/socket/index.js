import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/sockerMiddleware.js";
import { getUserConversationsForSocketIO } from "../controllers/conversationController.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

const onlineUser = new Map();

io.on("connection", async (socket) => {
  const { user } = socket;
  console.log(`${user.displayName}: ${socket.id}`);

  // Add the user to the online users map and emit the updated list to all clients
  onlineUser.set(user._id, socket.id);
  io.emit("online-users", Array.from(onlineUser.keys()));

  // Join the user to their conversation rooms
  const conversationIds = await getUserConversationsForSocketIO(user._id);
  conversationIds.forEach((id) => {
    socket.join(id);
  });

  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.join(user._id.toString())

  socket.on("disconnect", () => {
    onlineUser.delete(user._id);
    io.emit("online-users", Array.from(onlineUser.keys()));

    console.log(`Socket disconnected: ${socket.id}`);
  });
});

export { io, app, server };
