import express from "express";
import dotenv, { decrypt } from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import checkUrlSafety from "./routes/checkUrl.routes.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import {app} from "./socket/socket.js";
import deleteOldMessages from "./services/messageCleanupService.js";
import communityRoutes from "./routes/community.routes.js";
import encrypt from "./routes/encrypt.routes.js";
import decrypt2 from "./routes/decrypt.routes.js";
import cron from "node-cron";
import cors from "cors";
import fs from "fs";
import { httpServer } from "./socket/socket.js";  


dotenv.config();

const PORT = process.env.PORT || 4000;
const __dirname = path.resolve();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, "/frontend/dist")));

// Configuración de CORS (Ahora HTTP)
app.use(cors({
  origin: 'http://localhost:3000', // Cambié https por http
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(cookieParser());

// Rutas de API
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/encrypt', encrypt);
app.use('/api/decrypt', decrypt2);
app.use('/api/checkUrlSafety', checkUrlSafety);

// Rutas comodín
app.get("*", (req, res) => {
  if (req.url.startsWith('/uploads')) return;
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// Trabajo programado con cron
cron.schedule('0 0 * * *', () => {
  console.log('Running message cleanup job...');
});

// Iniciar el servidor HTTP en el puerto adecuado
httpServer.listen(PORT, "0.0.0.0", () => {
  connectToMongoDB();
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});