import express from "express";
import { chatWithBot } from "../controllers/chatbot.controller.js";

const router = express.Router();
// Full path will be '/api/chatbot' due to app.use("/api/chatbot", chatbotRoutes)
router.post("/", chatWithBot);

export default router;
