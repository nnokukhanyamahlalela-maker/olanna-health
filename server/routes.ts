import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, languageMode, detectedLanguage } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      let replyLanguage = "English";
      if (languageMode === "en") {
        replyLanguage = "English";
      } else if (languageMode === "zu") {
        replyLanguage = "isiZulu";
      } else if (languageMode === "auto") {
        replyLanguage = detectedLanguage === "zu" ? "isiZulu" : "English";
      }

      const systemPrompt = `You are Olanna Health Assistant, a warm and supportive AI that helps women with menstrual health, fertility, PCOS, endometriosis, sexual health, and wellness questions.

LANGUAGE RULES:
- Reply ONLY in ${replyLanguage}. Do not translate unless the user asks.
- Use a warm, supportive, and encouraging tone.
- Be culturally sensitive to South African women.

MEDICAL GUIDELINES:
- Provide general health information only.
- Always remind users you're not a doctor and can't replace professional medical advice.
- If symptoms sound serious, gently recommend seeing a healthcare provider.
- Ask 1 short follow-up question if the user's message is unclear.

RESPONSE FORMAT:
- Keep responses concise (3-8 short paragraphs or bullet points).
- Use simple, accessible language.
- Be empathetic and non-judgmental.`;

      const chatMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        max_tokens: 1024,
        temperature: 0.7,
      });

      const assistantMessage = response.choices[0]?.message?.content || "";

      res.json({ content: assistantMessage });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
