import express from "express";
import {
  allUsers,
  allChats,
  allMesages,
  getDashboardStats,
  adminLogin,
  adminLogout,
  getAdminData,
} from "../controllers/admin-controller.js";
import { validateHandler, adminLoginValidator } from "../lib/validators.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

app.post("/verify", adminLoginValidator(), validateHandler, adminLogin);
app.get("/logout", adminLogout);
//only admin can access below routes
app.use(adminOnly);
app.get("/", getAdminData);
app.get("/users", allUsers);
app.get("/chats", allChats);
app.get("/messages", allMesages);
app.get("/stats", getDashboardStats);
export default app;
