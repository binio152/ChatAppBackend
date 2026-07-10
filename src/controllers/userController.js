import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({ user });
  } catch (err) {
    console.log("Error occurred while getting user profile", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const findByUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.trim() === "")
      return res.status(200).json({ message: "Username is required" });

    const user = await User.findOne({ username }).select(
      "_id displayName username avatarUrl",
    );

    return res.status(200).json({ user });
  } catch (err) {
    console.log("Error occurred while finding user by username", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
