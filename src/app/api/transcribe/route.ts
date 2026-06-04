import { generateText } from "ai";
import { modelTranscribe } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "Falta GOOGLE_GENERATIVE_AI_API_KEY en el servidor" },
      { status: 500 }
    );
  }

  const form = await req.formData();
  const blob = form.get("audio");
  if (!(blob instanceof Blob)) {
    return Response.json({ error: "No se recibió audio" }, { status: 400 });
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());

  try {
    const { text } = await generateText({
      model: modelTranscribe,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Transcribe este audio. Devuelve solo el texto transcrito, sin comentarios ni explicaciones.",
            },
            {
              type: "file",
              data: bytes,
              mediaType: blob.type || "audio/webm",
            },
          ],
        },
      ],
    });
    return Response.json({ text: text.trim() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return Response.json({ error: `Transcripción: ${msg}` }, { status: 500 });
  }
}
