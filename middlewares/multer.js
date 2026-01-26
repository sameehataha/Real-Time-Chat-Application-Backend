import multer from "multer";

// Configure storage to keep files in memory as Buffers
// This is required so that features.js can read file.buffer
const storage = multer.memoryStorage();

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit per file
  },
});

const singleAvatar = multerUpload.single("avatar");

const attachmentsMulter = multerUpload.array("files", 5);

export { singleAvatar, attachmentsMulter };
