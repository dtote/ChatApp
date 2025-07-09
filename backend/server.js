// server.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import checkUrlSafety from "./routes/checkUrl.routes.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import deleteOldMessages from "./routes/deleteOldMessages.routes.js";
import communityRoutes from "./routes/community.routes.js";
import encrypt from "./routes/encrypt.routes.js";
import decrypt2 from "./routes/decrypt.routes.js";
import pollRoutes from "./routes/polls.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import cron from "node-cron";
import cors from "cors";
import fs from "fs";
import http from "http";
import { initializeSocket } from "./socket/socket.js";
import sessionRoutes from './routes/session.routes.js';
import { swaggerUi, swaggerSpec } from "./swagger.js";
import yaml from 'js-yaml';
import { ENV_CONFIG } from "./config/environment.js";


dotenv.config();
const __dirname = path.resolve();
const PORT = process.env.PORT || 4000;

// Crear app y servidor
const app = express();
const httpServer = http.createServer(app);

// Iniciar socket.io
initializeSocket(httpServer);

// Middlewares
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    if (path.endsWith('.pdf')) {
      res.removeHeader('X-Frame-Options');
    }
  }
}));

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.use(cors({
  origin: [
    'http://localhost:3000',
  ],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/encrypt', encrypt);
app.use('/api/decrypt', decrypt2);
app.use('/api/checkUrlSafety', checkUrlSafety);
app.use('/api/deleteOldMessages', deleteOldMessages);
app.use('/api/poll', pollRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sessions', sessionRoutes);
const swaggerDocument = yaml.load(fs.readFileSync('./backend//docs/docs.yml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.all('/api/*', (req, res) => {
  res.status(404).json({ message: "API route not found" });
})

// Ruta comodín frontend
app.get("*", (req, res) => {
  if (req.url.startsWith('/uploads')) return;

  if (process.env.NODE_ENV === "development") {
    // Redirige a frontend local en desarrollo

    return res.redirect(`http://localhost:3000${req.originalUrl}`);
  } else if (process.env.NODE_ENV === "production") {
    // Sirve el build estático en producción
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  }

});

// Arrancar servidor
httpServer.listen(PORT, "0.0.0.0", () => {
  connectToMongoDB();
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});


// Exportar app (para pruebas)
export { app, httpServer };

