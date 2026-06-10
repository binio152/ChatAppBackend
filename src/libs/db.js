import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGGO_URI);
    console.log("DB connect successfully");
  } catch (err) {
    console.log("Error occured while connecting DB", err);
    process.exit(1);
  }
};
