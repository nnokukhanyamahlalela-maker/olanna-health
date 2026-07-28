import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { chatStorage } from "./storage";
import { apiKeyAuth } from "../../middleware/apiAuth";

let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured. Set AI_INTEGRATIONS_OPENAI_API_KEY.");
    }
    openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return openai;
}

export function registerChatRoutes(app: Express): void {
  // Get all conversations
  app.get("/api/conversations", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const conversations = await chatStorage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get single conversation with messages
  app.get("/api/conversations/:id", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid conversation id: must be a positive integer" });
      }
      const conversation = await chatStorage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      if (title !== undefined && (typeof title !== "string" || title.length > 200)) {
        return res.status(400).json({ error: "Invalid title: must be a string with max 200 characters" });
      }
      const conversation = await chatStorage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid conversation id: must be a positive integer" });
      }
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Send message and get AI response (streaming)
  app.post("/api/conversations/:id/messages", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id as string);
      if (isNaN(conversationId) || conversationId <= 0) {
        return res.status(400).json({ error: "Invalid conversation id: must be a positive integer" });
      }
      const { content } = req.body;
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ error: "Invalid content: must be a non-empty string" });
      }
      if (content.length > 10000) {
        return res.status(400).json({ error: "Invalid content: must not exceed 10000 characters" });
      }

      // Save user message
      await chatStorage.createMessage(conversationId, "user", content);

      // Get conversation history for context
      const messages = await chatStorage.getMessagesByConversation(conversationId);
      const chatMessages = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4.1-mini",
        messages: chatMessages,
        max_completion_tokens: 2048,
      });

      const assistantContent = completion.choices[0]?.message?.content || "";

      const assistantMessage = await chatStorage.createMessage(conversationId, "assistant", assistantContent);

      res.json({ userMessage: { role: "user", content }, assistantMessage: { role: "assistant", content: assistantContent, id: assistantMessage.id } });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });
}

