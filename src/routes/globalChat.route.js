import express from "express";
import Message from "../models/Message.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../uploads");

// Create uploads folder if it does not exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// GET: Get last 100 messages sorted by creation time ascending 
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: 1 })
      .limit(100)
      .exec();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages." });
  }
});

// POST: Save a new message (text only)
router.post("/", async (req, res) => {
  const { userId, username, text } = req.body;
  if (!userId || !username || !text) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  try {
    const newMessage = new Message({ userId, username, text });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Failed to save message." });
  }
});

// POST: Upload single file and create message with attachment info
router.post(
  "/upload",
  upload.single("file"), // 'file' should match frontend FormData field name
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      const newMessage = new Message({
  userId: req.body.userId,
  username: req.body.username,
  text: req.body.text || "",
  attachmentUrl: fileUrl,
  attachmentType: req.file.mimetype,
  attachmentName: req.file.originalname,  // Adding original file name  
  createdAt: new Date(),
});

      const savedMessage = await newMessage.save();
      res.status(201).json(savedMessage);
    } catch (error) {
      console.error("File upload failed:", error);
      res.status(500).json({ message: "Failed to upload file." });
    }
  }
);

// DELETE: Delete message by message ID
router.delete("/:id", async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }
    res.json({ message: "Message deleted." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete message." });
  }
});

export default router;
