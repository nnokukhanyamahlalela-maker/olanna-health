import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { apiKeyAuth } from "./middleware/apiAuth";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface UserContext {
  cycleDay: number;
  averageCycleLength: number;
  phase: string;
  symptoms: string[];
  bleedingLevel: string;
  painScore: number;
  onHormonalContraception: boolean;
  tryingToConceive: boolean;
}

type PromptBuilder = (ctx: { userContext: UserContext }) => string;

const PROMPT_TEMPLATES: Record<string, PromptBuilder> = {
  phase_today: ({ userContext }) => `
User context:
- cycleDay: ${userContext.cycleDay}
- avgCycleLength: ${userContext.averageCycleLength}
- phase: ${userContext.phase}
- symptoms: ${(userContext.symptoms || []).join(", ")}

Task:
Explain what this phase typically means and what is common to feel.
Give practical tips (sleep, movement, hydration).
Suggest 2-3 things to track today.
Include red flags and a short medical disclaimer.
Keep tone warm, simple, and non-alarming.
Do NOT diagnose.
`,

  symptom_normal: ({ userContext }) => `
User context:
- phase: ${userContext.phase}
- symptoms: ${(userContext.symptoms || []).join(", ")}
- bleedingLevel: ${userContext.bleedingLevel}
- painScore: ${userContext.painScore}

Task:
Explain whether these symptoms can be common in this phase (general info).
Offer self-care actions.
Suggest what to track.
List red flags.
No diagnosis. No medication dosing.
`,

  late_period: ({ userContext }) => `
User context:
- avgCycleLength: ${userContext.averageCycleLength}
- tryingToConceive: ${userContext.tryingToConceive}
- onHormonalContraception: ${userContext.onHormonalContraception}

Task:
List common reasons a period can be late (stress, illness, travel, weight changes, PCOS, etc).
Provide what to do next steps (tracking, pregnancy test timing as general info if TTC).
Red flags + disclaimer. No diagnosis.
`,

  cramps_help: ({ userContext }) => `
User context:
- phase: ${userContext.phase}
- painScore: ${userContext.painScore}
- bleedingLevel: ${userContext.bleedingLevel}

Task:
Explain common causes of cramps across the cycle.
Give at-home relief options (heat, gentle movement, hydration, rest).
Explain when cramps are concerning (sudden severe, fever, fainting, heavy bleeding).
No diagnosis. No dosing instructions.
`,

  pcos_basics: () => `
Task:
Explain PCOS in plain language, common signs, how clinicians diagnose it (general).
Suggest what to track (cycle length, symptoms, acne/hair changes, weight changes, mood).
Encourage medical evaluation for diagnosis.
Red flags + disclaimer. No diagnosis.
`,

  doctor_when: () => `
Task:
Give a clear list of reproductive health red flags that need urgent care vs routine appointment.
Keep it calm, practical, and short.
Add disclaimer.
`,
};

function buildPrompt(promptId: string, userContext: UserContext): string | null {
  const fn = PROMPT_TEMPLATES[promptId];
  if (!fn) return null;
  return fn({ userContext });
}

function wrapSafetyFooter(text: string): string {
  const footer =
    "\n\n---\n**Note:** I can share general health information, not a medical diagnosis. " +
    "If you have severe or sudden pain, fainting, fever, or very heavy bleeding (soaking pads hourly), please seek urgent care.";
  return text + footer;
}

const SYSTEM_PROMPT =
  "You are Olanna, a warm and knowledgeable women's health companion for African women, " +
  "particularly in South Africa. You speak like a trusted older sister — caring, grounded, and never condescending. " +
  "You follow South African health guidelines (SAHCS, SASOG) and evidence-based research.\n\n" +
  "Guidelines:\n" +
  "- Provide educational info about menstrual cycles and reproductive health.\n" +
  "- Do not diagnose. Do not give medication dosing. Encourage seeking professional care when appropriate.\n" +
  "- If urgent symptoms are described, advise urgent care.\n" +
  "- Use South African English spelling (e.g., colour, honour, organise).\n" +
  "- Keep tone warm, empathetic, conversational, and empowering. Never use emojis.\n" +
  "- Use **bold** for key terms and important points.\n" +
  "- Use bullet points (- ) for lists and actionable tips.\n" +
  "- Use ### headings to organise sections when the answer covers multiple topics.\n" +
  "- For the first message on a topic, give a thorough but concise answer (3-5 short paragraphs or a mix of paragraphs and bullets).\n" +
  "- For follow-up messages in a conversation, keep responses shorter and more conversational (1-3 paragraphs). " +
  "Don't repeat information already covered — build on what was said before.\n" +
  "- Sprinkle in warm South African expressions naturally (e.g., 'Sisi', 'my love', 'Sho') but don't overdo it.\n" +
  "- End with an encouraging note or a gentle follow-up question to keep the conversation going.";

export function registerAssistantRoutes(app: Express): void {
  app.post("/api/assistant", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { promptId, userContext, freeText, history } = req.body;

      const ctx: UserContext = {
        cycleDay: userContext?.cycleDay ?? 14,
        averageCycleLength: userContext?.averageCycleLength ?? 28,
        phase: userContext?.phase ?? "unknown",
        symptoms: userContext?.symptoms ?? [],
        bleedingLevel: userContext?.bleedingLevel ?? "none",
        painScore: userContext?.painScore ?? 0,
        onHormonalContraception: userContext?.onHormonalContraception ?? false,
        tryingToConceive: userContext?.tryingToConceive ?? false,
      };

      let userMessage: string;

      if (promptId) {
        const prompt = buildPrompt(promptId, ctx);
        if (!prompt) {
          return res.status(400).json({ error: "Invalid promptId" });
        }
        userMessage = prompt;
      } else if (freeText && typeof freeText === "string" && freeText.trim().length > 0) {
        if (freeText.length > 10000) {
          return res.status(400).json({ error: "Message too long (max 10000 characters)" });
        }
        userMessage = `User context:\n- cycleDay: ${ctx.cycleDay}\n- phase: ${ctx.phase}\n- symptoms: ${(ctx.symptoms || []).join(", ")}\n\nUser question:\n${freeText.trim()}`;
      } else {
        return res.status(400).json({ error: "Either promptId or freeText is required" });
      }

      const conversationMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: SYSTEM_PROMPT },
      ];

      if (Array.isArray(history) && history.length > 0) {
        const recentHistory = history.slice(-10);
        for (const msg of recentHistory) {
          if (msg && (msg.role === "user" || msg.role === "assistant") && typeof msg.content === "string") {
            conversationMessages.push({ role: msg.role, content: msg.content });
          }
        }
      }

      conversationMessages.push({ role: "user", content: userMessage });

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: conversationMessages,
        temperature: 0.4,
        max_completion_tokens: 1500,
      });

      const raw = completion.choices?.[0]?.message?.content?.trim() || "";
      const reply = wrapSafetyFooter(raw);

      return res.json({ reply });
    } catch (error) {
      console.error("Assistant error:", error);
      return res.status(500).json({ error: "AI request failed" });
    }
  });
}
