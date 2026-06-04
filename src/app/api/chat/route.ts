import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { zodResponseFormat } from "openai/helpers/zod";
import { ExtractionSchema, type Card } from "@/lib/schema";
import { geocode } from "@/lib/geocode";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const MODEL_NORMAL = "gpt-5.4-mini";
const MODEL_HEAVY = "gpt-5.5";

const SYSTEM_PROMPT = `Eres el asistente de "Feeder", una app que escanea documentos por chat.
Tu trabajo: conversar en español con el usuario para extraer y completar la información de un documento,
y mantener actualizada una "tarjeta" estructurada.

Reglas:
- Devuelve SIEMPRE el estado COMPLETO de la tarjeta (todos los campos acumulados hasta ahora), no solo lo nuevo.
- "fields" son pares etiqueta/valor claros y bien organizados (ej: Nombre, Cédula, Monto, Fecha).
- Si el usuario adjunta una imagen o documento, léelo y extrae todos los datos relevantes.
- Si aparece una dirección o lugar, ponlo en "locationQuery" para ubicarlo en el mapa.
- "assistantMessage" es breve y útil: confirma lo anotado y pregunta lo que falte.
- No inventes datos que el usuario no haya dado.`;

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Falta OPENAI_API_KEY en el servidor" },
      { status: 500 }
    );
  }

  const { messages, card, image, heavy } = (await req.json()) as {
    messages: ChatMessage[];
    card: Card;
    image?: { dataUrl: string; kind: string } | null;
    heavy?: boolean;
  };

  const openai = new OpenAI({ apiKey });
  const model = heavy ? MODEL_HEAVY : MODEL_NORMAL;

  const apiMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "system",
      content: `Estado actual de la tarjeta (JSON): ${JSON.stringify(card)}`,
    },
    ...messages,
  ];

  if (image?.dataUrl) {
    apiMessages.push({
      role: "user",
      content: [
        {
          type: "text",
          text: `Documento adjunto (${image.kind}). Léelo y extrae toda la información para la tarjeta.`,
        },
        { type: "image_url", image_url: { url: image.dataUrl } },
      ],
    });
  }

  try {
    const completion = await openai.chat.completions.parse({
      model,
      messages: apiMessages,
      response_format: zodResponseFormat(ExtractionSchema, "extraction"),
    });

    const parsed = completion.choices[0].message.parsed;
    if (!parsed) {
      return Response.json({ error: "No se pudo extraer" }, { status: 500 });
    }

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
      model,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return Response.json({ error: `OpenAI: ${msg}` }, { status: 500 });
  }
}
