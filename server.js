import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import http from "http";

import authRoutes from "./src/routes/auth.route.js";
import userRoutes from "./src/routes/user.route.js";
import chatRoutes from "./src/routes/chat.route.js";
import chatbotRoutes from "./src/routes/chatbot.route.js";
import globalChatRoutes from "./src/routes/globalChat.route.js";
import { connectDB } from "./src/lib/db.js";
import Message from "./src/models/Message.js";
import multer from "multer";


const app = express();
const PORT = process.env.PORT;
// const __dirname = path.resolve();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
  
const server = http.createServer(app);


import { Server } from "socket.io";
const io = new Server(server, {
  cors: {
    origin:"https://streamify-frontend-6qmi.onrender.com",
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

// ======= MULTER SETUP WITH ABSOLUTE UPLOADS PATH =============
// Ensure uploads folder exists at absolute path Backend/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads")); // absolute path to 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // unique filename
  },
});
const upload = multer({ storage });

// ======= SERVE UPLOADS FOLDER STATICALLY =====================
// This makes files accessible under http://localhost:5001/uploads/<filename>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ROUTES ========================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/messages", globalChatRoutes);

// ========== UPLOAD ROUTE TO HANDLE FILE UPLOAD =========
app.post(
  "/api/upload",
  upload.single("file"), // 'file' is the field name expected
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      // Save message with attachment info
      const newMessage = new Message({
        userId: req.body.userId,
        username: req.body.username,
        text: req.body.text || "",
        attachmentUrl: fileUrl,
        attachmentType: req.file.mimetype,
        createdAt: new Date(),
      });

      const savedMessage = await newMessage.save();

      // Broadcast uploaded message to all users via socket.io
      io.emit("receiveMessage", savedMessage);

      res.status(201).json(savedMessage);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "File upload failed." });
    }
  }
);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

// ========== SOCKET.IO EVENTS ================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  socket.on("sendMessage", async (message) => {
    try {
      const newMessage = new Message({
        userId: message.userId,
        username: message.username,
        text: message.text,
      });
      const savedMessage = await newMessage.save();

      io.emit("receiveMessage", savedMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("deleteMessage", async (messageId) => {
    try {
      await Message.findByIdAndDelete(messageId);
      io.emit("removedMessage", messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

 
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
 
