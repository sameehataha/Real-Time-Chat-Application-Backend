import { Chat } from "../models/chat-model.js";
import { Message } from "../models/message-model.js";
import { User } from "../models/user-model.js";
import { faker } from "@faker-js/faker";
const createSmapleChat = async (numChats) => {
  try {
    const users = await User.find().select("_id");
    const userIds = users.map((user) => user._id);
    const chatsPromise = [];
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users.length; j++) {
        chatsPromise.push(
          Chat.create({
            name: faker.lorem.words(3),
            members: [userIds[i], userIds[j]],
          }),
        );
      }
    }
    await Promise.all(chatsPromise);
    console.log("done chats created", numChats);
    process.exit(1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
const groupSampleChat = async (numsChats) => {
  try {
    const users = await User.find().select("_id");
    const chatsPromise = [];
    for (let i = 0; i < numsChats; i++) {
      const randomMembers = faker.helpers.arrayElements(users, {
        min: 3,
        max: users.length,
      });
      const members = [];
      for (let i = 0; i < randomMembers; i++) {
        const randomIndex = Math.floor(Math.random() * users.length);
        const randomeUser = users[randomIndex];
      }
      for (let j = 0; j < randomMembers.length; j++) {
        members.push(randomMembers[j]._id);
      }
      chatsPromise.push(
        Chat.create({
          name: faker.lorem.words(3),
          isGroupChat: true,
          members: members,
          creator: randomMembers[0],
        }),
      );
    }
    await Promise.all(chatsPromise);
    console.log("done chats created", numsChats);
    process.exit(1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
const createMessages = async (numMessages) => {
  try {
    const users = await User.find().select("_id");
    const chats = await Chat.find().select("_id");
    const messagesPromise = [];
    for (let i = 0; i < numMessages; i++) {
      const randomUserIndex = Math.floor(Math.random() * users.length);
      const randomChatIndex = Math.floor(Math.random() * chats.length);
      messagesPromise.push(
        Message.create({
          sender: users[randomUserIndex]._id,
          chat: chats[randomChatIndex]._id,
          content: faker.lorem.sentence(10),
        }),
      );
    }
    await Promise.all(messagesPromise);
    console.log("done messages created", numMessages);
    process.exit(1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
const createMessagesInChat = async (chatId, numMessages) => {
  try {
    const users = await User.find().select("_id");

    const messagesPromise = [];
    for (let i = 0; i < numMessages; i++) {
      const randomUserIndex = Math.floor(Math.random() * users.length);
      messagesPromise.push(
        Message.create({
          sender: users[randomUserIndex]._id,
          chat: chatId,
          content: faker.lorem.sentence(10),
        }),
      );
    }
    await Promise.all(messagesPromise);
    console.log("done messages created", numMessages);
    process.exit(1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
export {
  createSmapleChat,
  groupSampleChat,
  createMessages,
  createMessagesInChat,
};
