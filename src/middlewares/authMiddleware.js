import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token is missing" });
    }

    const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedUser.userId).select(
      "-hashedPassword",
    );
    

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("Error occurred while authentication JWT", err);

    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return res
        .status(403)
        .json({ message: "Access token have been expired or invalid" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
