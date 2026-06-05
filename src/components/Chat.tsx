"use client";

import { useRef, useState } from "react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function MicIcon() {
  return (
    <svg {...iconProps}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="22" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-4.5-4.5L3 21" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}

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
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <p className="mt-6 text-center text-xs text-neutral-500">
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
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-[#d6ff00] px-2.5 py-1.5 text-xs text-black"
                  : "max-w-[80%] rounded-2xl rounded-bl-sm bg-neutral-800 px-2.5 py-1.5 text-xs"
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Barra de botones: audio, imagen, escanear */}
      <div className="flex gap-1.5 border-t border-white/10 px-3 pt-2">
        <button
          type="button"
          onClick={toggleRecord}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
            recording
              ? "bg-red-600 text-white"
              : "bg-neutral-900 text-neutral-200 ring-1 ring-white/10 hover:bg-neutral-800"
          }`}
        >
          <MicIcon />
          {recording ? "Detener" : "Audio"}
        </button>

        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-2 py-1.5 text-xs font-medium text-neutral-200 ring-1 ring-white/10 transition hover:bg-neutral-800"
        >
          <ImageIcon />
          Imagen
        </button>

        <button
          type="button"
          onClick={() => scanInputRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-2 py-1.5 text-xs font-medium text-neutral-200 ring-1 ring-white/10 transition hover:bg-neutral-800"
        >
          <ScanIcon />
          Escanear
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
      <form onSubmit={submit} className="flex items-center gap-2 px-3 py-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="flex-1 rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs outline-none ring-1 ring-white/10 placeholder:text-neutral-600 focus:ring-[#d6ff00]/60"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-[#d6ff00] px-3.5 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
        >
          {busy ? "…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
