import { config as dotenvConfig } from "dotenv";
import server from "./server.js";
import { connectDB } from "./libs/db.js";

dotenvConfig();
const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT} (accessible on LAN)`);
  });
});
