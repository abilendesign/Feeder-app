import { google } from "@ai-sdk/google";

/**
 * Proveedor de IA actual: GEMINI (Google) — gratis para empezar.
 *
 * Para volver a OpenAI más adelante:
 *   1. import { openai } from "@ai-sdk/openai";
 *   2. modelNormal = openai("gpt-5.4-mini")
 *      modelHeavy  = openai("gpt-5.5")
 *   3. La transcripción de audio con OpenAI usa otro endpoint
 *      (audio.transcriptions), así que ahí habría que revertir /api/transcribe.
 *
 * Lee la API key de la env var GOOGLE_GENERATIVE_AI_API_KEY.
 */
// NOTA: gemini-2.5-pro NO está disponible en el free tier (cuota 0).
// Por eso "heavy" también usa flash. Si algún día se activa plan de pago,
// cambiar modelHeavy a google("gemini-2.5-pro").
export const modelNormal = google("gemini-2.5-flash");
export const modelHeavy = google("gemini-2.5-flash");
export const modelTranscribe = google("gemini-2.5-flash");
