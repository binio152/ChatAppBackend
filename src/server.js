import express from "express";

const server = express();

server.use(express.json())

server.get("/test", (req, res) => {
  res.send("Server is running ...");
});

export { server };
export default server;
