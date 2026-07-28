import { AuthenticationError, PermissionDeniedError } from "openai";

/**
 * Returns true if the error indicates the OpenAI API key is missing or invalid.
 * Covers two cases:
 *  1. Our own getOpenAI() threw because the env var is not set.
 *  2. OpenAI rejected the request with a 401 (invalid/expired key).
 */
export function isOpenAIConfigError(err: unknown): boolean {
  if (err instanceof AuthenticationError) return true;
  if (err instanceof PermissionDeniedError) return true;
  if (err instanceof Error && err.message.includes("AI_INTEGRATIONS_OPENAI_API_KEY")) return true;
  return false;
}

/**
 * Builds a standardised 503 error body for AI configuration failures.
 */
export function openAIConfigErrorBody() {
  return {
    error: "ai_not_configured",
    message:
      "AI features are not available. The OpenAI API key is missing or invalid. Please contact the app administrator.",
  };
}
