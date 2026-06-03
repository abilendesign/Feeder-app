"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import InfoCard from "@/components/InfoCard";
import Chat, { type ChatMessage } from "@/components/Chat";
import { emptyCard, type Card } from "@/lib/schema";

// El mapa solo corre en cliente (usa WebGL).
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function Home() {
  const [card, setCard] = useState<Card>(emptyCard);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleSend(text: string) {
    const userMsg: ChatMessage = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, card }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `⚠️ ${data.error ?? "Error del servidor"}` },
        ]);
        return;
      }

      setCard(data.card);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.assistantMessage },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "⚠️ No se pudo conectar con el servidor." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function handleAudio(blob: Blob) {
    const kb = Math.round(blob.size / 1024);
    setMessages((m) => [
      ...m,
      { role: "user", content: `🎤 Audio grabado (${kb} KB)` },
      {
        role: "assistant",
        content:
          "Audio recibido. La transcripción (OpenAI Speech-to-Text) se conecta cuando pongamos la key.",
      },
    ]);
  }

  function handleImage(file: File, kind: "imagen" | "escaneo") {
    setMessages((m) => [
      ...m,
      {
        role: "user",
        content: `${kind === "imagen" ? "🖼️ Imagen" : "📷 Escaneo"}: ${file.name}`,
      },
      {
        role: "assistant",
        content:
          "Archivo recibido. La lectura del documento (OpenAI visión) se conecta cuando pongamos la key.",
      },
    ]);
  }

  return (
    <main className="flex h-screen flex-col">
      {/* MITAD SUPERIOR: mapa de fondo + tarjeta */}
      <section className="relative h-1/2 w-full overflow-hidden">
        <MapView location={card.location} />
        <div className="pointer-events-none absolute inset-0 flex items-start justify-end p-4">
          <InfoCard
            card={card}
            onClear={() => setCard(emptyCard)}
            onRemoveField={(i) =>
              setCard((c) => ({
                ...c,
                fields: c.fields.filter((_, idx) => idx !== i),
              }))
            }
          />
        </div>
      </section>

      {/* MITAD INFERIOR: chatbot */}
      <section className="h-1/2 w-full">
        <Chat
          messages={messages}
          onSend={handleSend}
          onAudio={handleAudio}
          onImage={handleImage}
          busy={busy}
        />
      </section>
    </main>
  );
}
