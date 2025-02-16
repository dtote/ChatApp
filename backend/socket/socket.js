import { Server } from 'socket.io';
import http from 'http';
import fs from 'fs';
import express from 'express';
import path from 'path';

const __dirname = path.resolve();
const app = express();


// Crear el servidor HTTP (ya no usamos certificados SSL)
const httpServer = http.createServer(app);

// Configurar Socket.io con el servidor HTTP
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"], // Cambié https por http
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket"],
  },
});

// Mapeo de usuarios con sus sockets
const userSocketMap = {}; // {userId: socketId}

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId !== "undefined") userSocketMap[userId] = socket.id;

  // Notificar a todos los usuarios conectados sobre los usuarios en línea
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Manejar la desconexión del usuario
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Exportar app, io y el servidor HTTP
export { app, io, httpServer };
