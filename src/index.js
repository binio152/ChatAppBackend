import { config as dotenvConfig } from "dotenv";
import app from "./server.js";
import { connectDB } from "./libs/db.js";
import { server } from "./socket/index.js";

dotenvConfig();
const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT} (accessible on LAN)`);
  });
});
