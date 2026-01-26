import { compare } from "bcrypt";
import { User } from "../models/user-model.js";
import { Chat } from "../models/chat-model.js";
import { Request } from "../models/request-model.js";
import {
  cookieOption,
  emitEvent,
  sendToken,
  uploadFilesToCloudinary,
} from "../utils/features.js";
import { getOtherMembers } from "../lib/helper.js";
import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import { NEW_REQUEST, REFECTCH_CHATS } from "../constants/events.js";

//create a new user and save it to the dba nd save it to cookie
const newUser = TryCatch(async (req, res, next) => {
  console.log("Creating new user...");
  console.log("Body:", req.body);
  console.log("File received:", req.file ? "YES" : "NO");

  const { name, username, password, bio } = req.body;
  const file = req.file;

  if (!file) {
    console.error(" No file uploaded");
    return next(new ErrorHandler("Please upload an avatar image", 400));
  }

  console.log(`File found: ${file.originalname} (${file.size} bytes)`);

  try {
    // Upload to Cloudinary
    console.log("Uploading to Cloudinary...");
    const result = await uploadFilesToCloudinary([file]);
    console.log("Cloudinary response:", result);

    const avatar = {
      public_id: result[0].public_id,
      url: result[0].url,
    };

    console.log("Avatar object:", avatar);

    // Create user
    const user = await User.create({
      name,
      username,
      password,
      bio,
      avatar,
    });

    console.log("User created:", user._id);
    sendToken(res, user, 201, "User created successfully");
  } catch (error) {
    console.error("Error:", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});
//login user and save token in cookie
const login = TryCatch(async (req, res, next) => {
  const { username, password } = req.body;
  console.log(username, password);
  const user = await User.findOne({ username }).select("+password");
  if (!user)
    return next(
      new ErrorHandler("Invalid credentials username or password", 404),
    );
  console.log(user);
  const isMatch = await compare(password, user.password);
  if (!isMatch)
    return next(
      new ErrorHandler("Invalid credentials username or password", 404),
    );
  sendToken(res, user, 201, `welcome back successfully ${user.name}`);
});
const getMyProfile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user).select("-password");
  res.status(200).json({
    success: true,
    user,
  });
});
const logout = TryCatch(async (req, res) => {
  res
    .status(200)
    .cookie("talkie-token", "", { ...cookieOption, maxAge: 0 })
    .json({
      success: true,
      message: "logged out successfully",
    });
});

const searchUser = TryCatch(async (req, res) => {
  const { name } = req.query;

  const myChats = await Chat.find({
    groupChat: false,
    members: req.user,
  });

  const allUsersFromMyChats = myChats.map((chat) => chat.members).flat();

  const allUsersExceptMeAndFriends = await User.find({
    _id: { $nin: allUsersFromMyChats },
    name: { $regex: name, $options: "i" },
  }).select("_id name avatar");

  //Handle missing avatars gracefully
  const users = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => ({
    _id,
    name,
    avatar: avatar?.url || "", //Always return string, never undefined
  }));

  res.status(200).json({
    success: true,
    users,
  });
});

const sendFriendRequest = TryCatch(async (req, res, next) => {
  const { userId } = req.body;
  const request = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  });
  if (request) return next(new ErrorHandler("Request already sent", 400));
  await Request.create({
    sender: req.user,
    receiver: userId,
  });
  emitEvent(req, NEW_REQUEST, [userId], {
    message: "You have a new friend request",
  });
  res.status(200).json({
    success: true,
    message: "Request sent successfully",
  });
});
const acceptFriendRequest = TryCatch(async (req, res, next) => {
  const { requestId, accept } = req.body;
  const request = await Request.findById(requestId)
    .populate("sender", "name")
    .populate("receiver", "name");
  console.log(request);
  if (!request) return next(new ErrorHandler("Request not found", 404));
  if (request.receiver._id.toString() !== req.user.toString())
    return next(
      new ErrorHandler("You are not authorized to accept this request", 401),
    );
  if (!accept) {
    await request.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Friend Request rejected successfully",
    });
  }
  const members = [request.sender._id, request.receiver._id];
  await Promise.all([
    Chat.create({
      name: `${request.sender.name}-${request.receiver.name}`,
      members,
      groupChat: false,
    }),
    request.deleteOne(),
  ]);
  emitEvent(req, REFECTCH_CHATS, members, { message: "New Friend added" });
  res.status(200).json({
    success: true,
    message: "Friend Request accepted successfully",
    senderId: request.sender._id,
  });
});
const getallNotifications = TryCatch(async (req, res) => {
  const requests = await Request.find({ receiver: req.user }).populate(
    "sender",
    "name avatar",
  );
  const allRequests = requests.map(({ _id, sender }) => ({
    _id,
    sender: {
      _id: sender._id,
      name: sender.name,
      avatar: sender.avatar.url,
    },
  }));
  return res.status(200).json({
    success: true,
    allRequests,
  });
});

const getMyFriends = TryCatch(async (req, res, next) => {
  try {
    const chatId = req.query.chatId;

    const chats = await Chat.find({
      members: req.user,
      groupChat: false,
    }).populate("members", "name avatar");

    const friends = chats
      .map(({ members }) => {
        try {
          // Find the OTHER member (not current user)
          const otherUser = members.find(
            (member) => member._id.toString() !== req.user.toString(),
          );

          if (!otherUser) {
            console.warn("No other user found in chat");
            return null;
          }

          let avatarUrl = "";
          if (otherUser.avatar) {
            avatarUrl =
              typeof otherUser.avatar === "string"
                ? otherUser.avatar
                : otherUser.avatar.url || "";
          }

          return {
            _id: otherUser._id,
            name: otherUser.name || "Unknown User",
            avatar: avatarUrl,
          };
        } catch (err) {
          console.error("Error processing friend:", err);
          return null;
        }
      })
      .filter(Boolean);

    if (chatId) {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return next(new ErrorHandler("Chat not found", 404));
      }

      const availableFriends = friends.filter(
        (friend) => !chat.members.includes(friend._id),
      );

      return res.status(200).json({
        success: true,
        friends: availableFriends,
      });
    } else {
      return res.status(200).json({
        success: true,
        friends,
      });
    }
  } catch (err) {
    console.error("Error in getMyFriends:", err);
    return next(
      new ErrorHandler("Failed to fetch friends: " + err.message, 500),
    );
  }
});
export {
  login,
  newUser,
  getMyProfile,
  logout,
  searchUser,
  sendFriendRequest,
  acceptFriendRequest,
  getallNotifications,
  getMyFriends,
};
