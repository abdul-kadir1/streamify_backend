 

 

// import axios from "axios";

// export const chatWithBot = async (req, res) => {
//   try {
//     const { message } = req.body;

//     if (!message || typeof message !== "string") {
//       return res.status(400).json({ error: "Message is required and must be a string" });
//     }

//     // Send request to local Ollama server running phi3 model
//     const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
//       model: "phi3",
//       prompt: `You are a helpful language learning assistant. Answer clearly:\n\n${message}`,
//       stream: false
//     });

//     const botReply = ollamaResponse.data?.response?.trim() || "No reply received.";

//     res.json({ reply: botReply });
//   } catch (error) {
//     console.error("Chatbot error:", error.message);
//     res.status(500).json({ error: "Chatbot error. Try again later." });
//   }
// };



// backend/src/controllers/chatbot.controller.js
import 'dotenv/config';
import fetch from "node-fetch"; // If using Node >=18, fetch is global, else install node-fetch

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export const chatWithBot  = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required and must be a string" });
    }

    // First API call with reasoning enabled
    const firstResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "x-ai/grok-4.1-fast:free",
        messages: [{ role: "user", content: message }],
        reasoning: { enabled: true }
      })
    });

    const firstResult = await firstResponse.json();
    const firstAssistantMessage = firstResult.choices[0].message;

    // Prepare messages array for continued reasoning
    const messages = [
      { role: "user", content: message },
      { role: "assistant", content: firstAssistantMessage.content, reasoning_details: firstAssistantMessage.reasoning_details }
    ];

    // Optional: follow-up user message to continue reasoning
    // You can customize this or accept it from frontend
    // messages.push({ role: "user", content: "Are you sure? Think carefully." });

    // Second API call - continue reasoning if needed
    const secondResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "x-ai/grok-4.1-fast:free",
        messages: messages
      })
    });

    const secondResult = await secondResponse.json();
    const secondAssistantMessage = secondResult.choices[0].message;

    res.json({ reply: secondAssistantMessage.content, reasoning: secondAssistantMessage.reasoning_details });

  } catch (error) {
    console.error("Chatbot error:", error.message);
    res.status(500).json({ error: "Chatbot error. Try again later." });
  }
};
