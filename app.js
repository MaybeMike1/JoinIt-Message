import express from "express";
import expressWs from "express-ws";
import mongoose from "mongoose";
import { ChatMessage } from "./models/Chat.js";
import { connectToDb } from "./db/connection.js";
import { config } from "dotenv";

config();

const app = express();
const { applyTo } = expressWs(app);
connectToDb();

const clients = {};

applyTo(app);

app.ws("/chat/:chatRoomId/:clientId", (ws, req) => {
    const { chatRoomId, clientId } = req.params;

    if (!chatRoomId || !clientId) {
        ws.close(4001, "Invalid URI");
        return;
    }

    ws.chatRoomId = chatRoomId;

    if (!clients[chatRoomId]) {
        clients[chatRoomId] = {};
    }

    clients[chatRoomId][clientId] = ws;

    console.log(`Client ${clientId} connected to chatroom ${chatRoomId}.`);

    ws.on("message", async (message) => {
        console.log(`Received message from ${clientId} in chatroom ${chatRoomId}: ${message}`);

        try {
            const newMessage = new ChatMessage({
                chatRoomId,
                clientId,
                message,
            });

            await newMessage.save();
        } catch (error) {
            console.log(error);
        }

        Object.values(clients[chatRoomId]).forEach((client) => {
            client.send(JSON.stringify({ clientId, message }));
        });
    });

    ws.on("close", () => {
        console.log(`Client ${clientId} disconnected from chatroom ${chatRoomId}.`);
        delete clients[chatRoomId][clientId];

        if (Object.keys(clients[chatRoomId]).length === 0) {
            delete clients[chatRoomId];
        }
    });
});

// Your other routes and middleware can go here...

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
