const chatModel = require("../models/chatModel");

const createChat = async (request, response) => {
  const { firstId, secondId } = request.body;
  try {
    //check if chat b/w users already exists
    const chat = await chatModel.findOne({
      members: { $all: [firstId, secondId] },
    });
    if (chat) return response.status(200).json(chat);

    //if not exists
    const newChat = new chatModel({ members: [firstId, secondId] });
    const result = await newChat.save();
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json(error);
  }
};

const findUserChats = async (request, response) => {
  const userId = request.params.userId;
  try {
    const chats = await chatModel.find({
      members: { $in: [userId] },
    });
    response.status(200).json(chats);
  } catch (error) {
    response.status(500).json(error);
  }
};

const findChat = async (request, response) => {
  const { firstId, secondId } = request.params;
  try {
    const chat = await chatModel.findOne({
      members: { $all: [firstId, secondId] },
    });
    response.status(200).json(chat);
  } catch (error) {
    response.status(500).json(error);
  }
};

module.exports = { createChat, findUserChats, findChat };
