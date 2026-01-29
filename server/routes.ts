import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const LANGUAGE_CONFIG: Record<string, { name: string; nativeName: string; greeting: string }> = {
  en: { 
    name: "English", 
    nativeName: "English",
    greeting: "Hello"
  },
  zu: { 
    name: "isiZulu", 
    nativeName: "isiZulu",
    greeting: "Sawubona"
  },
  af: { 
    name: "Afrikaans", 
    nativeName: "Afrikaans",
    greeting: "Hallo"
  },
  st: { 
    name: "Sesotho", 
    nativeName: "Sesotho",
    greeting: "Dumela"
  },
  xh: { 
    name: "isiXhosa", 
    nativeName: "isiXhosa",
    greeting: "Molo"
  },
  ss: { 
    name: "siSwati", 
    nativeName: "siSwati",
    greeting: "Sawubona"
  },
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, selectedLanguage } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const langCode = selectedLanguage || "en";
      const langConfig = LANGUAGE_CONFIG[langCode] || LANGUAGE_CONFIG.en;
      const languageName = langConfig.name;

      const systemPrompt = `You are Olanna Health Assistant, a warm and supportive AI that helps women with menstrual health, fertility, PCOS, endometriosis, sexual health, and wellness questions.

CRITICAL LANGUAGE REQUIREMENT:
- You MUST respond ONLY in ${languageName} (${langConfig.nativeName}).
- Never switch languages unless explicitly asked by the user.
- If you don't know how to say something in ${languageName}, explain it simply in ${languageName}.

CULTURAL CONTEXT:
- You are designed for South African women.
- Be culturally sensitive and respectful of local practices and beliefs.
- Use warm, supportive, and encouraging language appropriate for ${languageName} speakers.

MEDICAL GUIDELINES:
- Provide general health information only.
- Always remind users you're not a doctor and can't replace professional medical advice.
- If symptoms sound serious, gently recommend seeing a healthcare provider or clinic.
- Ask 1 short follow-up question if the user's message is unclear.

RESPONSE FORMAT:
- Keep responses concise (3-8 short paragraphs or bullet points).
- Use simple, accessible language.
- Be empathetic and non-judgmental.
- Avoid medical jargon - explain terms simply.`;

      const chatMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: chatMessages,
        max_completion_tokens: 1024,
      });

      const assistantMessage = response.choices[0]?.message?.content || "";

      res.json({ content: assistantMessage });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  app.get("/api/languages", (_req, res) => {
    const languages = Object.entries(LANGUAGE_CONFIG).map(([code, config]) => ({
      code,
      name: config.name,
      nativeName: config.nativeName,
      greeting: config.greeting,
    }));
    res.json(languages);
  });

  const httpServer = createServer(app);
  return httpServer;
}
