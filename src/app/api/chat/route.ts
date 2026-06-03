import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ExtractionSchema, type Card } from "@/lib/schema";
import { geocode } from "@/lib/geocode";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `Eres el asistente de "Feeder", una app que escanea documentos por chat.
Tu trabajo: conversar en español con el usuario para extraer y completar la información de un documento,
y mantener actualizada una "tarjeta" estructurada.

Reglas:
- Devuelve SIEMPRE el estado COMPLETO de la tarjeta (todos los campos acumulados hasta ahora), no solo lo nuevo.
- "fields" son pares etiqueta/valor claros y bien organizados (ej: Nombre, Cédula, Monto, Fecha).
- Si el usuario menciona una dirección o lugar, ponlo en "locationQuery" para ubicarlo en el mapa.
- "assistantMessage" es breve y útil: confirma lo anotado y pregunta lo que falte.
- No inventes datos que el usuario no haya dado.`;

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Falta OPENAI_API_KEY en .env.local" },
      { status: 500 }
    );
  }

  const { messages, card } = (await req.json()) as {
    messages: ChatMessage[];
    card: Card;
  };

  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "system",
        content: `Estado actual de la tarjeta (JSON): ${JSON.stringify(card)}`,
      },
      ...messages,
    ],
    response_format: zodResponseFormat(ExtractionSchema, "extraction"),
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) {
    return Response.json({ error: "No se pudo extraer" }, { status: 500 });
  }

  // Geocodifica la ubicación si el modelo dio una consulta.
  const location = parsed.locationQuery
    ? await geocode(parsed.locationQuery)
    : card.location;

  const updatedCard: Card = {
    documentType: parsed.documentType,
    summary: parsed.summary,
    fields: parsed.fields,
    location,
  };

  return Response.json({
    assistantMessage: parsed.assistantMessage,
    card: updatedCard,
  });
}
