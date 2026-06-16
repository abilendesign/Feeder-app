import { generateObject, type ModelMessage } from "ai";
import { PropertyExtractionSchema, type Card } from "@/lib/schema";
import { modelNormal, modelHeavy } from "@/lib/ai";
import { geocode } from "@/lib/geocode";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `Eres el asistente de "Feeder", una app inmobiliaria en Panamá.
Conversas en español para capturar y completar los datos de una PROPIEDAD y mantener actualizada su tarjeta.

Reglas:
- Devuelve SIEMPRE el estado COMPLETO de la tarjeta; NO borres datos previos que ya tengan valor.
- Campos a extraer: tipo de propiedad, operación (venta/alquiler), estado del anuncio, título,
  precio y moneda, área en m², recámaras, baños, parking, condición, estado, descripción,
  dirección y referencias de ubicación.
- Si el usuario adjunta una imagen o documento, léelo y extrae todo lo relevante.
- En "locationQuery" pon la mejor dirección/lugar (incluye ciudad y "Panamá") para ubicar en el mapa.
- "assistantMessage": breve, confirma lo captado y pregunta lo que falte.
- No inventes datos que el usuario no haya dado.`;

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "Falta GOOGLE_GENERATIVE_AI_API_KEY en el servidor" },
      { status: 500 }
    );
  }

  const { messages, card, image, heavy, source } = (await req.json()) as {
    messages: ChatMessage[];
    card: Card;
    image?: { dataUrl: string; kind: string } | null;
    heavy?: boolean;
    source?: string;
  };

  const model = heavy ? modelHeavy : modelNormal;
  const aiMessages: ModelMessage[] = [...messages];

  if (image?.dataUrl) {
    aiMessages.push({
      role: "user",
      content: [
        {
          type: "text",
          text: `Documento adjunto (${image.kind}). Léelo y extrae toda la información de la propiedad.`,
        },
        { type: "image", image: image.dataUrl },
      ],
    });
  }

  try {
    const { object: p } = await generateObject({
      model,
      schema: PropertyExtractionSchema,
      system: `${SYSTEM_PROMPT}\n\nEstado actual de la tarjeta (JSON): ${JSON.stringify(card)}`,
      messages: aiMessages,
    });

    // Geocodifica la mejor pista de ubicación: locationQuery o, si no, la dirección leída.
    const locHint = p.locationQuery ?? p.addressText ?? null;
    const query =
      locHint && !/panam/i.test(locHint) ? `${locHint}, Panamá` : locHint;
    const geo = query ? await geocode(query) : null;

    // Merge: la IA actualiza/añade, nunca borra con null lo que ya existía.
    const updatedCard: Card = {
      propertyType: p.propertyType ?? card.propertyType,
      listingStatus: p.listingStatus ?? card.listingStatus,
      operationType: p.operationType ?? card.operationType,
      title: p.title ?? card.title,
      price: p.price ?? card.price,
      currency: p.currency ?? card.currency,
      areaM2: p.areaM2 ?? card.areaM2,
      bedrooms: p.bedrooms ?? card.bedrooms,
      bathrooms: p.bathrooms ?? card.bathrooms,
      parking: p.parking ?? card.parking,
      condition: p.condition ?? card.condition,
      status: p.status ?? card.status,
      description: p.description ?? card.description,
      addressText: p.addressText ?? geo?.address ?? card.addressText,
      locationExtra: p.locationExtra ?? card.locationExtra,
      lat: geo ? geo.latitude : card.lat,
      lng: geo ? geo.longitude : card.lng,
      photos: card.photos,
      sourceType: source ?? card.sourceType ?? "chat",
      detectedDate: p.detectedDate ?? card.detectedDate,
    };

    return Response.json({ assistantMessage: p.assistantMessage, card: updatedCard });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return Response.json({ error: `IA: ${msg}` }, { status: 500 });
  }
}
