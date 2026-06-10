import { config as dotenvConfig } from "dotenv";
import server from "./server.js";
import { connectDB } from "./libs/db.js";

dotenvConfig();

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});
