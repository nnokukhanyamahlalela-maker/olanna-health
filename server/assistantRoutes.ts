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

function buildSystemPrompt(ctx: UserContext): string {
  return `You are Olanna, a warm and knowledgeable women's health assistant for African women, particularly in South Africa. You follow South African health guidelines (SAHCS, SASOG) and evidence-based research.

Your tone is empathetic, conversational, and empowering. You never diagnose or prescribe. You encourage users to consult a healthcare provider for specific medical concerns. You use "you" and "your" to keep things personal.

Current user context:
- Cycle day: ${ctx.cycleDay} of ${ctx.averageCycleLength}
- Current phase: ${ctx.phase}
- Reported symptoms: ${ctx.symptoms.length > 0 ? ctx.symptoms.join(", ") : "none reported"}
- Bleeding level: ${ctx.bleedingLevel}
- Pain score: ${ctx.painScore}/10
- On hormonal contraception: ${ctx.onHormonalContraception ? "yes" : "no"}
- Trying to conceive: ${ctx.tryingToConceive ? "yes" : "no"}

Guidelines:
- Reference the user's current cycle phase and day when relevant
- Suggest evidence-based lifestyle adjustments (nutrition, movement, rest)
- Keep responses concise (3-5 paragraphs max)
- Use South African English spelling (e.g., "colour", "honour", "organise")
- Never use emojis
- If asked about medications or diagnoses, gently redirect to a healthcare provider`;
}

const PROMPT_INSTRUCTIONS: Record<string, string> = {
  phase_today:
    "Explain what phase the user is currently in based on their cycle day. Describe what is happening hormonally and what they might expect physically and emotionally. Offer one practical tip for this phase.",
  symptom_normal:
    "The user wants to know if their current symptoms are typical for their cycle phase. Reference their logged symptoms and cycle day. Explain what is common and what might warrant attention. Be reassuring but honest.",
  late_period:
    "Explain common reasons a period can be late, including stress, weight changes, hormonal shifts, PCOS, and early pregnancy. Tailor the response to whether the user is trying to conceive. Suggest when to see a doctor.",
  cramps_help:
    "Explain what causes menstrual cramps (prostaglandins, uterine contractions). Reference the user's pain score. Suggest evidence-based relief: heat therapy, gentle movement, magnesium-rich foods, anti-inflammatory options. Mention when to seek medical help.",
  pcos_basics:
    "Explain PCOS clearly: what it is, common signs (irregular cycles, acne, weight changes, hair growth), how it is diagnosed (Rotterdam criteria), and what users can track to support management. Be validating and non-alarmist.",
  doctor_when:
    "List red flags that warrant seeing a healthcare provider: very heavy bleeding, severe pain unresponsive to home care, irregular cycles lasting over 3 months, bleeding between periods, symptoms of infection. Encourage proactive health management.",
};

export function registerAssistantRoutes(app: Express): void {
  app.post("/api/assistant", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { promptId, userContext, freeText } = req.body;

      if (!promptId && !freeText) {
        return res.status(400).json({ error: "Either promptId or freeText is required" });
      }

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

      const systemPrompt = buildSystemPrompt(ctx);

      let userMessage = freeText || "";
      if (promptId && PROMPT_INSTRUCTIONS[promptId]) {
        userMessage = PROMPT_INSTRUCTIONS[promptId];
      } else if (promptId) {
        userMessage = `Answer the user's question about: ${promptId}`;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_completion_tokens: 1024,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content || "I wasn't able to generate a response. Please try again.";

      res.json({ reply });
    } catch (error) {
      console.error("Assistant error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });
}
