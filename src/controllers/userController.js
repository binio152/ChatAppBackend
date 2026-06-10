export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({ user });
  } catch (err) {
    console.log("Error occurred while getting user profile", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
