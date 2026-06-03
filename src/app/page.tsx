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

  // TODO: reemplazar este mock por /api/chat (OpenAI Structured Outputs).
  function handleSend(text: string) {
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);

    // Mock temporal: detecta "etiqueta: valor" y los agrega a la tarjeta.
    const match = text.match(/^(.+?):\s*(.+)$/);
    if (match) {
      setCard((c) => ({
        ...c,
        fields: [...c.fields, { label: match[1].trim(), value: match[2].trim() }],
      }));
    }

    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: match
            ? `Anoté "${match[1].trim()}" en la tarjeta. ¿Algo más?`
            : "Recibido. (La IA real se conecta cuando tengamos las API keys.)",
        },
      ]);
      setBusy(false);
    }, 400);
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
        <Chat messages={messages} onSend={handleSend} busy={busy} />
      </section>
    </main>
  );
}
