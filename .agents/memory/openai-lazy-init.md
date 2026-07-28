---
name: OpenAI lazy init
description: OpenAI clients must be lazily initialized to avoid crashing without API key
---

**Rule:** Never write `const openai = new OpenAI(...)` at module top-level. Always wrap in a lazy getter:
```ts
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) throw new Error("OpenAI key missing");
    _openai = new OpenAI({ apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY, baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL });
  }
  return _openai;
}
```

**Why:** Server starts without `OPENAI_API_KEY` set. Eager initialization crashes the process at import time with `OpenAIError: Missing credentials`, preventing the entire backend from starting.

**How to apply:** All files in `server/replit_integrations/` and `server/cycleImportRoutes.ts` follow this pattern.
