import { Server } from 'socket.io';
import https from 'https';
import fs from 'fs';
import express from 'express';
import path from 'path';

const __dirname = path.resolve();
const app = express();

// Cargar el certificado y la clave privada
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "keys", "localhost.key")),
	cert: fs.readFileSync(path.join(__dirname, "keys", "localhost.crt")),
};

// Crear el servidor HTTPS
const httpsServer = https.createServer(httpsOptions, app);

// Configurar Socket.io con el servidor HTTPS
const io = new Server(httpsServer, {
  cors: {
    origin: ["https://localhost:3000"], 
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
  if (userId != "undefined") userSocketMap[userId] = socket.id;

  // Notificar a todos los usuarios conectados sobre los usuarios en línea
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Manejar la desconexión del usuario
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Exportar app, io y server
export { app, io, httpsServer };
