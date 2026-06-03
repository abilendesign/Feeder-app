"use client";

import { useRef, useState } from "react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function Chat({
  messages,
  onSend,
  onAudio,
  onImage,
  busy,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onAudio: (blob: Blob) => void;
  onImage: (file: File, kind: "imagen" | "escaneo") => void;
  busy?: boolean;
}) {
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    onSend(text);
    setInput("");
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  async function toggleRecord() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (ev) => ev.data.size && chunksRef.current.push(ev.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        onAudio(new Blob(chunksRef.current, { type: "audio/webm" }));
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      alert("No se pudo acceder al micrófono.");
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a] text-neutral-100">
      {/* Mensajes */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-neutral-500">
            Escribe, graba un audio, sube una imagen o escanea un documento.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-[#d6ff00] px-3 py-2 text-sm text-black"
                  : "max-w-[80%] rounded-2xl rounded-bl-sm bg-neutral-800 px-3 py-2 text-sm"
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Barra de botones: audio, imagen, escanear */}
      <div className="flex gap-2 border-t border-white/10 px-3 pt-3">
        <button
          type="button"
          onClick={toggleRecord}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            recording
              ? "bg-red-600 text-white"
              : "bg-neutral-900 text-neutral-200 ring-1 ring-white/10 hover:bg-neutral-800"
          }`}
        >
          🎤 {recording ? "Detener" : "Audio"}
        </button>

        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-200 ring-1 ring-white/10 transition hover:bg-neutral-800"
        >
          🖼️ Imagen
        </button>

        <button
          type="button"
          onClick={() => scanInputRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-200 ring-1 ring-white/10 transition hover:bg-neutral-800"
        >
          📷 Escanear
        </button>

        {/* inputs ocultos */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImage(f, "imagen");
            e.target.value = "";
          }}
        />
        <input
          ref={scanInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImage(f, "escaneo");
            e.target.value = "";
          }}
        />
      </div>

      {/* Input de texto */}
      <form onSubmit={submit} className="flex items-center gap-2 px-3 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="flex-1 rounded-full bg-neutral-900 px-4 py-2 text-sm outline-none ring-1 ring-white/10 placeholder:text-neutral-600 focus:ring-[#d6ff00]/60"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-[#d6ff00] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {busy ? "…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
