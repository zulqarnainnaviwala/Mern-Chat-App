const messageModel = require("../models/messageModel");

//createMessage
const createMessage = async (request, response) => {
  const { chatId, senderId, text } = request.body;
  const message = new messageModel({
    chatId,
    senderId,
    text,
  });

  try {
    const result = await message.save();
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json(error);
  }
};

//getMessages
const getMessages = async (request, response) => {
  const { chatId } = request.params;
  try {
    const messages = await messageModel.find({ chatId });
    response.status(200).json(messages);
  } catch (error) {
    response.status(500).json(error);
  }
};

module.exports = { createMessage, getMessages };
