import { TryCatch } from "../middlewares/error.js";
import { User } from "../models/user-model.js";
import { Chat } from "../models/chat-model.js";
import { Message } from "../models/message-model.js";
import { ErrorHandler } from "../utils/utility.js";
import { adminCookieOption } from "../utils/features.js";
import { adminSecretKey } from "../app.js";
import jwt from "jsonwebtoken";

const adminLogin = TryCatch(async (req, res, next) => {
  const { secretKey } = req.body;

  console.log("Admin login attempt with secretKey:", secretKey);
  console.log("Expected secretKey:", adminSecretKey);

  const isMatch = secretKey === adminSecretKey;
  if (!isMatch) {
    console.log("Secret key mismatch");
    return next(new ErrorHandler("Invalid secret key", 401));
  }

  // Create a simple payload (not the secretKey itself)
  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  console.log("Admin login successful");
  console.log("Setting cookie with options:", adminCookieOption);

  return res
    .status(200)
    .cookie("talkie-admin-token", token, adminCookieOption)
    .json({
      success: true,
      message: "Admin logged in successfully",
    });
});

const allUsers = TryCatch(async (req, res) => {
  const users = await User.find({});
  const transformedUsers = await Promise.all(
    users.map(async ({ name, _id, username, avatar }) => {
      const [groups, friends] = await Promise.all([
        Chat.countDocuments({ groupChat: true, members: _id }),
        Chat.countDocuments({ groupChat: false, members: _id }),
      ]);
      return { name, _id, username, avatar: avatar.url, groups, friends };
    }),
  );

  res.status(200).json({
    success: true,
    users: transformedUsers,
  });
});

const allChats = TryCatch(async (req, res) => {
  const chats = await Chat.find({})
    .populate("members", "name avatar")
    .populate("creator", "name avatar");
  const transformedChats = await Promise.all(
    chats.map(async ({ name, _id, members, creator, groupChat }) => {
      const totalMessages = await Message.countDocuments({ chat: _id });
      return {
        name,
        _id,
        creator: {
          name: creator?.name || "none",
          avatar: creator?.avatar.url || "none",
        },
        members: members.map((member) => ({
          _id: member._id,
          name: member.name,
          avatar: member.avatar.url,
        })),
        groupChat,
        avatar: members.slice(0, 3).map((member) => member.avatar.url),
        totalMembers: members.length,
        totalMessages,
      };
    }),
  );

  res.status(200).json({
    success: true,
    chats: transformedChats,
  });
});

const allMesages = TryCatch(async (req, res) => {
  const messages = await Message.find({})
    .populate("sender", "name avatar")
    .populate("chat", "groupChat");

  const transformedMessages = messages
    .filter((message) => message.sender && message.chat) // Filter out messages with null sender or chat
    .map(({ content, attachments, sender, chat, _id, createdAt }) => ({
      content,
      attachments: attachments || [],
      sender: {
        _id: sender._id,
        name: sender.name || "Unknown",
        avatar:
          sender.avatar?.url ||
          "https://www.w3schools.com/howto/img_avatar.png",
      },
      chat: chat._id,
      _id,
      createdAt,
      groupChat: chat.groupChat,
    }));

  console.log("Messages fetched and transformed:", transformedMessages.length);

  return res.status(200).json({
    success: true,
    messages: transformedMessages,
  });
});

const getDashboardStats = TryCatch(async (req, res) => {
  const [groupCount, userCounts, messageCounts, totalChatCounts] =
    await Promise.all([
      Chat.countDocuments({ groupChat: true }),
      User.countDocuments({}),
      Message.countDocuments({}),
      Chat.countDocuments({}),
    ]);

  const today = new Date();
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const last7dayMessages = await Message.find({
    createdAt: { $gte: last7Days, $lte: today },
  }).select("createdAt");

  const messages = new Array(7).fill(0);
  last7dayMessages.forEach((message) => {
    const index =
      (today.getTime() - message.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const index1 = Math.floor(index);
    messages[6 - index1]++;
  });

  const stats = {
    groupCount,
    userCounts,
    messageCounts,
    totalChatCounts,
    messagesChart: messages,
  };

  return res.status(200).json({
    success: true,
    stats,
  });
});

const adminLogout = TryCatch(async (req, res, next) => {
  console.log("Admin logout");
  return res
    .status(200)
    .cookie("talkie-admin-token", null, {
      ...adminCookieOption,
      maxAge: 0,
    })
    .json({
      success: true,
      message: "Admin logged out successfully",
    });
});

const getAdminData = TryCatch(async (req, res, next) => {
  console.log("getAdminData called - admin authenticated");
  return res.status(200).json({
    admin: true,
    message: "Admin data fetched successfully",
  });
});

export {
  allUsers,
  allChats,
  allMesages,
  getDashboardStats,
  adminLogin,
  adminLogout,
  getAdminData,
};
