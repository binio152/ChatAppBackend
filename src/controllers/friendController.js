import Friend from "../models/Friend.js";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const { to, message } = req.body;
    const from = req.user._id;
    if (from.toString() === to.toString())
      return res
        .status(400)
        .json({ message: "Cannot send request to yourself" });

    const userExists = await User.exists({ _id: to });
    if (!userExists)
      return res
        .status(404)
        .json({ message: "Cannot send request to unexisting user" });

    let userA = from.toString();
    let userB = to.toString();
    if (userA > userB) [userA, userB] = [userB, userA];

    const [alreadyFriends, existingRequest] = await Promise.all([
      Friend.findOne({ userA, userB }),
      FriendRequest.findOne({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      }),
    ]);
    if (alreadyFriends)
      return res.status(400).json({ message: "You are already friends" });
    if (existingRequest)
      return res.status(400).json({ message: "Friend request already sent" });

    const request = await FriendRequest.create({ from, to, message });

    return res
      .status(201)
      .json({ message: "Send friend request successfully!", request });
  } catch (err) {
    console.log("Error occurred while sending friend request", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);
    if (!request)
      return res.status(404).json({ message: "Friend request not found" });
    if (request.to.toString() !== userId.toString())
      return res
        .status(403)
        .json({ message: "You are not the recipient of this request" });

    const friend = await Friend.create({
      userA: request.from,
      userB: request.to,
    });

    await FriendRequest.findByIdAndDelete(requestId);

    const from = await User.findById(request.from)
      .select("_id displayName avatarUrl")
      .lean();

    return res.status(200).json({
      message: "Friend request accepted successfully",
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    });
  } catch (err) {
    console.log("Error occurred while accepting request", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);
    if (!request)
      return res.status(404).json({ message: "Friend request not found" });
    if (request.to.toString() !== userId)
      return res
        .status(403)
        .json({ message: "You are not the recipient of this request" });

    await FriendRequest.findByIdAndDelete(requestId);

    return res
      .status(204)
      .json({ message: "Friend request declined successfully" });
  } catch (err) {
    console.log("Error occurred while declining request", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getFriendLists = async (req, res) => {
  try {
    const userId = req.user._id;

    const polulateFields = "_id displayName avatarUrl";
    const friendships = await Friend.find({
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate("userA", polulateFields)
      .populate("userB", polulateFields)
      .lean();

    if (!friendships.length) return res.status(200).json({ friendLists: [] });

    const friendLists = friendships.map((relation) =>
      relation.userA._id.toString() === userId.toString()
        ? relation.userA
        : relation.userB,
    );

    return res.status(200).json({ friendLists });
  } catch (err) {
    console.log("Error occurred while getting friend lists", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getFriendRequestLists = async (req, res) => {
  try {
    const userId = req.user._id;
    const poluplateFields = "_id username displayName avatarUrl";

    const [sendRequest, receivedRequest] = await Promise.all([
      FriendRequest.find({ from: userId }).populate("to", poluplateFields),
      FriendRequest.find({ to: userId }).populate("from", poluplateFields),
    ]);

    return res.status(200).json({ sendRequest, receivedRequest });
  } catch (err) {
    console.log("Error occurred while getting friend request lists", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
