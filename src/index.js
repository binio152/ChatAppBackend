import { config as dotenvConfig } from "dotenv";
import app from "./server.js";
import { connectDB } from "./libs/db.js";
import { server } from "./socket/index.js";
import { v2 as cloudinary } from "cloudinary";

dotenvConfig({ override: true });
const PORT = process.env.PORT || 5001;

// CLOUDINARY Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectDB().then(() => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT} (accessible on LAN)`);
  });
});
