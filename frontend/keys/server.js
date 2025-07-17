import express from "express";
import dotenv, { decrypt } from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import checkUrlSafety from "./routes/checkUrl.routes.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import {app, server} from "./socket/socket.js";
import deleteOldMessages from "./services/messageCleanupService.js";
import communityRoutes from "./routes/community.routes.js";
import encrypt from "./routes/encrypt.routes.js";
import decrypt2 from "./routes/decrypt.routes.js";
import cron from "node-cron";
import cors from "cors";
import fs from "fs";
import https from "https";

dotenv.config();

const PORT = process.env.PORT || 4000;
const __dirname = path.resolve();

// Lee los archivos del certificado y la clave privada
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, "keys", "localhost.key")),
  cert: fs.readFileSync(path.join(__dirname, "keys", "localhost.crt")),
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Middleware to serve static files from /uploads
app.use(express.static(path.join(__dirname, "/frontend/dist"))); // Middleware to serve the frontend application

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET'], // Make sure to allow the GET method
  credentials: true
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

// Wildcard route configuration
// This route must go after all static file routes and API routes
app.get("*", (req, res) => {
  if (req.url.startsWith('/uploads')) return;
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// Trabajo programado con cron
cron.schedule('0 0 * * *', () => {
  console.log('Running message cleanup job...');
  deleteOldMessages();
});

// Inicia el servidor HTTPS
const httpsServer = https.createServer(sslOptions, app);

httpsServer.listen(PORT, () => {
  connectToMongoDB();
  deleteOldMessages();
  console.log(`Server running on https://localhost:${PORT}`);
});