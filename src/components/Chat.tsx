"use client";

import { useRef, useState } from "react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function Chat({
  messages,
  onSend,
  busy,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  busy?: boolean;
}) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    onSend(text);
    setInput("");
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a] text-neutral-100">
      {/* Mensajes */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-neutral-500">
            Escribe o describe el documento para empezar a llenar la tarjeta.
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

      {/* Input */}
      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-t border-white/10 px-3 py-3"
      >
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
