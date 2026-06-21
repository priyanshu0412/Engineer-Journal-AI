/**
 * Central runtime configuration & "mock mode" flags.
 *
 * MOCK_MODE lets the entire app run with NO real credentials:
 *   - in-memory MongoDB (mongodb-memory-server)
 *   - auth bypassed with a fixed dev user
 *   - AI responses generated locally (no Anthropic call)
 *   - email "sent" to the console (no Resend call)
 *   - demo data seeded automatically
 *
 * It's also partially graceful outside mock mode: if a specific paid key is
 * missing, that piece falls back to a mock so you can test without buying it.
 */

export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

export const DEV_USER_ID = "dev-user";
export const DEV_USER_EMAIL = "dev@devtrack.local";
export const DEV_USER_NAME = "Dev User";

/** Which AI provider to call. "gemini" uses Google's free tier; default "claude". */
export function aiProvider(): "gemini" | "claude" {
  return (process.env.AI_PROVIDER || "claude").toLowerCase() === "gemini"
    ? "gemini"
    : "claude";
}

/** Use mock AI in mock mode or when the selected provider's key is missing. */
export function useMockAI(): boolean {
  if (MOCK_MODE) return true;
  return aiProvider() === "gemini"
    ? !process.env.GEMINI_API_KEY
    : !process.env.ANTHROPIC_API_KEY;
}

/** Use mock email when in mock mode or when no Resend key is configured. */
export function useMockEmail(): boolean {
  return MOCK_MODE || !process.env.RESEND_API_KEY;
}
