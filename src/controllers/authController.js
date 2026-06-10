import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "Missing required fields: username, password, email, firstName, lastName",
      });
    }

    const duplicateUser = await User.findOne({ username });
    if (duplicateUser) {
      return res.status(409).json({ message: "This username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    return res.status(201).json({ newUser });
  } catch (err) {
    console.log("Error occurred while signing up", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        message: "Missing required fields: username, password",
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_TTL },
    );

    const refreshToken = crypto.randomBytes(32).toString("hex");
    const refreshTokenTTL = Number(process.env.REFRESH_TOKEN_TTL);
    const session = await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + refreshTokenTTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: process.env.REFRESH_TOKEN_TTL,
    });

    return res.status(201).json({
      message: `User ${user.username} signed in successfully`,
      accessToken,
    });
  } catch (err) {
    console.log("Error occurred while signing in", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signOut = async (req, res) => {
  try {
    const token = req?.cookies?.refreshToken;
    if (token) {
      await Session.deleteOne({ refreshToken: token });
      res.clearCookie("refreshToken");
    }

    res.sendStatus(204);
  } catch (err) {
    console.log("Error occurred while signing out", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


