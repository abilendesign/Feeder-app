import OpenAI, { toFile } from "openai";

export const runtime = "nodejs";

const TRANSCRIBE_MODEL = "gpt-4o-mini-transcribe";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Falta OPENAI_API_KEY en el servidor" },
      { status: 500 }
    );
  }

  const form = await req.formData();
  const blob = form.get("audio");
  if (!(blob instanceof Blob)) {
    return Response.json({ error: "No se recibió audio" }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const file = await toFile(blob, "audio.webm", { type: "audio/webm" });
    const result = await openai.audio.transcriptions.create({
      model: TRANSCRIBE_MODEL,
      file,
    });
    return Response.json({ text: result.text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return Response.json({ error: `Transcripción: ${msg}` }, { status: 500 });
  }
}
