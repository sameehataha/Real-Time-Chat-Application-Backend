import { body, validationResult, check, param, query } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";

const registerValidator = () => [
  body("name", "name is required").notEmpty(),
  body("username", "username must be at least 5 characters long").isLength({
    min: 5,
  }),
  body("password", "password must be at least 8 characters long").isLength({
    min: 8,
  }),
  body("bio", "bio must be at least 10 characters long").isLength({ min: 10 }),
];
const loginValidator = () => [
  body("username", "username must be at least 5 characters long").isLength({
    min: 5,
  }),
  body("password", "password must be at least 8 characters long").isLength({
    min: 8,
  }),
];
const newGroupValidator = () => [
  body("name", "name must be at least 5 characters long").isLength({ min: 5 }),
  body("members")
    .notEmpty()
    .withMessage("members is required")
    .isArray({ min: 2, max: 50 })
    .withMessage("members must be an array with at least 2 members"),
];
const addMembersValidator = () => [
  body("chatId", "please provide chat id").notEmpty(),
  body("members")
    .notEmpty()
    .withMessage("members is required")
    .isArray({ min: 1, max: 50 })
    .withMessage("members must be an array with at least 2 members"),
];
const removeMembersValidator = () => [
  body("chatId", "please provide chat id").notEmpty(),
  body("userId", "please provide user id").notEmpty(),
];
const leaveGroupValidator = () => [
  param("id", "please provide chat id").notEmpty(),
];
const sendAttachmentsValidator = () => [
  body("chatId", "please provide chat id").notEmpty(),
];
const getMessagesValidator = () => [
  param("id", "please provide chat id").notEmpty(),
];
const getChatDetailsValidator = () => [
  param("id", "please provide chat id").notEmpty(),
];
const renameChatDetailsValidator = () => [
  param("id", "please provide chat id").notEmpty(),
  body("name", "please provide new name").notEmpty(),
];
const sendRequestValidator = () => [
  body("userId", "please provide user id").notEmpty(),
];
const acceptRequestValidator = () => [
  body("requestId", "please provide request id").notEmpty(),
  body("accept", "please provide accept value")
    .notEmpty()
    .withMessage("accept is required")
    .isBoolean()
    .withMessage("accept must be a boolean value"),
];
const adminLoginValidator = () => [
  body("secretKey", "please provide secret key").notEmpty(),
];
const validateHandler = (req, res, next) => {
  const errors = validationResult(req);
  const errorMessages = errors
    .array()
    .map((err) => err.msg)
    .join(", ");
  console.log(errorMessages);
  if (errors.isEmpty()) return next();
  else next(new ErrorHandler(errorMessages, 400));
};
export {
  registerValidator,
  validateHandler,
  loginValidator,
  newGroupValidator,
  addMembersValidator,
  removeMembersValidator,
  leaveGroupValidator,
  sendAttachmentsValidator,
  getMessagesValidator,
  getChatDetailsValidator,
  renameChatDetailsValidator,
  sendRequestValidator,
  acceptRequestValidator,
  adminLoginValidator,
};
