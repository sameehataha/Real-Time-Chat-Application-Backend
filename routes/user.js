import express from "express";
import {
  getMyProfile,
  login,
  logout,
  newUser,
} from "../controllers/user-controller.js";
import { singleAvatar } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  searchUser,
  sendFriendRequest,
  acceptFriendRequest,
  getallNotifications,
  getMyFriends,
} from "../controllers/user-controller.js";
import {
  registerValidator,
  validateHandler,
  loginValidator,
  sendRequestValidator,
  acceptRequestValidator,
} from "../lib/validators.js";
const app = express.Router();

//http://localhost:3000/user/new
app.post("/new", singleAvatar, registerValidator(), validateHandler, newUser);
//http://localhost:3000/user/login
app.post("/login", loginValidator(), validateHandler, login);

//user must be logged in to access the routes
app.use(isAuthenticated);
//then can access other routes
app.get("/me", getMyProfile);
app.get("/logout", logout);

//search user
app.get("/search", searchUser);

//send request
app.put(
  "/sendrequest",
  sendRequestValidator(),
  validateHandler,
  sendFriendRequest,
);
//accept request
app.put(
  "/acceptrequest",
  acceptRequestValidator(),
  validateHandler,
  acceptFriendRequest,
);
app.get("/notifications", getallNotifications);
app.get("/friends", getMyFriends);
export default app;
