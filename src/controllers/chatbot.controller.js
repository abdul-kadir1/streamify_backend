 

 

import axios from "axios";

export const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required and must be a string" });
    }

    // Send request to local Ollama server running phi3 model
    const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
      model: "phi3",
      prompt: `You are a helpful language learning assistant. Answer clearly:\n\n${message}`,
      stream: false
    });

    const botReply = ollamaResponse.data?.response?.trim() || "No reply received.";

    res.json({ reply: botReply });
  } catch (error) {
    console.error("Chatbot error:", error.message);
    res.status(500).json({ error: "Chatbot error. Try again later." });
  }
};
