import { userSocketId } from "../app.js";

const getOtherMembers = (members, userId) => {
  return members.find(
    (member) =>
      member._id.toString() !== userId.toString() &&
      member.toString() !== userId.toString(),
  );
};

const getBase64 = (file) => {
  console.log("CONVERTING FILE TO BASE64");
  if (!file) {
    console.error("File is null/undefined");
    throw new Error("File is null or undefined");
  }

  console.log(`File name: ${file.originalname}`);
  console.log(`File mimetype: ${file.mimetype}`);
  console.log(`File size: ${file.size} bytes`);

  // Check if file has buffer
  if (!file.buffer) {
    console.error("File buffer is missing");
    console.log(`Available properties:`, Object.keys(file));
    throw new Error("File buffer is missing");
  }

  try {
    // Convert buffer to base64 string
    const base64String = file.buffer.toString("base64");

    if (!base64String || base64String.length === 0) {
      console.error("Base64 string is empty");
      throw new Error("Base64 conversion resulted in empty string");
    }

    console.log(`Base64 conversion successful`);
    console.log(`Base64 length: ${base64String.length} characters`);
    console.log(`Base64 preview: ${base64String.substring(0, 50)}...`);

    // Create data URI for Cloudinary
    const dataURI = `data:${file.mimetype};base64,${base64String}`;
    console.log(`Data URI created`);
    console.log(`Data URI length: ${dataURI.length} characters`);
    return dataURI;
  } catch (error) {
    console.error(`Error in getBase64:`, error.message);
    throw error;
  }
};

const getSockets = (users = []) => {
  console.log(`\nRESOLVING SOCKETS FOR ${users.length} USERS`);
  const sockets = users.map((user) => userSocketId.get(user.toString()));

  return sockets;
};

export { getOtherMembers, getBase64, getSockets };
