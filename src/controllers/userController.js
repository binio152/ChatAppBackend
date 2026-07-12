import { uploadToCloudinary } from "../middlewares/uploadMiddleware.js";
import { v2 as cloudinary } from "cloudinary";
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

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { displayName, avatarUrl, bio, phone, username, email } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User does not exist" });

    if (username !== undefined) {
      const normalizedUsername = username.trim().toLowerCase();
      if (!normalizedUsername) {
        return res.status(400).json({ message: "Username is required" });
      }

      const duplicateUsername = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: userId },
      });
      if (duplicateUsername) {
        return res
          .status(409)
          .json({ message: "This username already exists" });
      }

      user.username = normalizedUsername;
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        return res.status(400).json({ message: "Email is required" });
      }

      const duplicateEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      });
      if (duplicateEmail) {
        return res.status(409).json({ message: "This email already exists" });
      }

      user.email = normalizedEmail;
    }

    if (displayName !== undefined) user.displayName = displayName;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;

    const updatedUser = await user.save();

    const { hashedPassword, ...userResponse } = updatedUser.toObject();
    return res.status(200).json({
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (err) {
    console.log("Error occurred while updating user profile", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const currentUser = await User.findById(userId).select("avatarId");
    if (currentUser && currentUser.avatarId) {
      try {
        await cloudinary.uploader.destroy(currentUser.avatarId);
        console.log(
          "Deleted previous image successfully",
          currentUser.avatarId,
        );
      } catch (destroyError) {
        console.log(
          "Error occurred while deleting previous image on Cloudinary:",
          destroyError,
        );
      }
    }

    const result = await uploadToCloudinary(file.buffer);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatarUrl: result.secure_url,
        avatarId: result.public_id,
      },
      { returnDocument: "after" },
    ).select("avatarUrl");

    if (!updatedUser || !updatedUser.avatarUrl) {
      return res.status(400).json({ message: "Uploaded avatar return null" });
    }

    return res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
  } catch (err) {
    console.error("Error occurred while uploading avatar: ", err);
    return res
      .status(500)
      .json({ message: "Internal server error", details: err.message });
  }
};
