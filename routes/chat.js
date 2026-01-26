import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { attachmentsMulter } from "../middlewares/multer.js";
import {
  newGroupChat,
  getMyChats,
  getMyGroups,
  addMembers,
  removeMembers,
  leaveGroup,
  sendAttachments,
  getChatDetails,
  renameGroup,
  deleteChat,
  getMessages,
} from "../controllers/chat-controller.js";
import {
  newGroupValidator,
  addMembersValidator,
  validateHandler,
  removeMembersValidator,
  leaveGroupValidator,
  sendAttachmentsValidator,
  getMessagesValidator,
  getChatDetailsValidator,
  renameChatDetailsValidator,
} from "../lib/validators.js";
const app = express.Router();
//user must be logged in to access the routes
app.use(isAuthenticated);
app.post("/new", newGroupValidator(), validateHandler, newGroupChat);
app.get("/my", getMyChats);
app.get("/my/groups", getMyGroups);
app.put("/addmembers", addMembersValidator(), validateHandler, addMembers);
app.put(
  "/removemembers",
  removeMembersValidator(),
  validateHandler,
  removeMembers,
);
///chat/leave/sdasda2ad
app.delete("/leave/:id", leaveGroupValidator(), validateHandler, leaveGroup);
//send attachments
app.post(
  "/message",
  attachmentsMulter,
  sendAttachmentsValidator(),
  validateHandler,
  sendAttachments,
);
//get messages
app.get("/message/:id", getMessagesValidator(), validateHandler, getMessages);
//get chat details,rename,delete
app
  .route("/:id")
  .get(getChatDetailsValidator(), validateHandler, getChatDetails)
  .put(renameChatDetailsValidator(), validateHandler, renameGroup)
  .delete(getChatDetailsValidator(), validateHandler, deleteChat);
export default app;
