import { generateObject, type ModelMessage } from "ai";
import { ExtractionSchema, type Card } from "@/lib/schema";
import { modelNormal, modelHeavy } from "@/lib/ai";
import { geocode } from "@/lib/geocode";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

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
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "Falta GOOGLE_GENERATIVE_AI_API_KEY en el servidor" },
      { status: 500 }
    );
  }

  const { messages, card, image, heavy } = (await req.json()) as {
    messages: ChatMessage[];
    card: Card;
    image?: { dataUrl: string; kind: string } | null;
    heavy?: boolean;
  };

  const model = heavy ? modelHeavy : modelNormal;

  const aiMessages: ModelMessage[] = [...messages];

  if (image?.dataUrl) {
    aiMessages.push({
      role: "user",
      content: [
        {
          type: "text",
          text: `Documento adjunto (${image.kind}). Léelo y extrae toda la información para la tarjeta.`,
        },
        { type: "image", image: image.dataUrl },
      ],
    });
  }

  try {
    const { object: parsed } = await generateObject({
      model,
      schema: ExtractionSchema,
      system: `${SYSTEM_PROMPT}\n\nEstado actual de la tarjeta (JSON): ${JSON.stringify(card)}`,
      messages: aiMessages,
    });

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
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return Response.json({ error: `IA: ${msg}` }, { status: 500 });
  }
}
