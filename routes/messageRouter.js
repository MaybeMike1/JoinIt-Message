// websocketRouter.js

import express from 'express'
import expressWs from 'express-ws'
import { ChatMessage } from './../models/Chat.js'

const router = express.Router()
const { applyTo } = expressWs(router)

const clients = {}

router.get('/chat/:chatRoomId', async (req, res) => {
  try {
    const chatRoomId = req.params.chatRoomId;
    const result = await ChatMessage.find({ chatRoomId: chatRoomId });
    res.status(200).send(result)
  } catch (error) {
    res.status(500).send({ error: 'Something went wrong on the server' });
  }
})

router.ws('/chat/:chatRoomId/:clientId', (ws, req) => {
  const { chatRoomId, clientId } = req.params

  if (!chatRoomId || !clientId) {
    ws.close(4001, 'Invalid URI')
    return
  }

  ws.chatRoomId = chatRoomId

  if (!clients[chatRoomId]) {
    clients[chatRoomId] = {}
  }

  clients[chatRoomId][clientId] = ws

  console.log(`Client ${clientId} connected to chatroom ${chatRoomId}.`)

  ws.on('message', async (message) => {
    console.log(
      `Received message from ${clientId} in chatroom ${chatRoomId}: ${message}`,
    )

    try {
      const newMessage = new ChatMessage({
        chatRoomId,
        clientId,
        message,
      })

      await newMessage.save()
    } catch (error) {
      console.log(error)
    }

    Object.values(clients[chatRoomId]).forEach((client) => {
      client.send(JSON.stringify({ clientId, message }))
    })
  })

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected from chatroom ${chatRoomId}.`)
    delete clients[chatRoomId][clientId]

    if (Object.keys(clients[chatRoomId]).length === 0) {
      delete clients[chatRoomId]
    }
  })
})

export default router
