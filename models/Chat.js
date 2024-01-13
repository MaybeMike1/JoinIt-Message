import {Schema, model} from "mongoose";

const chatMessageSchema = new Schema({
    chatRoomId: String,
    clientId: String,
    message: String,
    timeStamp: { type: Date, default: Date.now }
});

const ChatMessage = model("ChatMessage", chatMessageSchema);

export { ChatMessage, chatMessageSchema };
