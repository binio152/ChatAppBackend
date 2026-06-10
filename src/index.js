import { config as dotenvConfig } from "dotenv";
import server from "./server.js";

dotenvConfig();

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
