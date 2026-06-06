"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import InfoCard from "@/components/InfoCard";
import Chat, { type ChatMessage } from "@/components/Chat";
import { emptyCard, type Card } from "@/lib/schema";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function Home() {
  const [card, setCard] = useState<Card>(emptyCard);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);

  async function sendToChat(opts: {
    displayText: string;
    baseCard?: Card;
    image?: { dataUrl: string; kind: string };
    heavy?: boolean;
    source?: string;
  }) {
    const base = opts.baseCard ?? card;
    const history = [
      ...messages,
      { role: "user", content: opts.displayText } as ChatMessage,
    ];
    setMessages(history);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          card: base,
          image: opts.image ?? null,
          heavy: !!opts.heavy,
          source: opts.source,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.error ?? "Error del servidor" },
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
        { role: "assistant", content: "No se pudo conectar con el servidor." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function handleSend(text: string) {
    sendToChat({ displayText: text, source: "chat" });
  }

  function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleImage(file: File, kind: "imagen" | "escaneo") {
    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const heavy = file.size > 1_500_000;
      const base: Card = {
        ...card,
        photos: [...card.photos, { url: dataUrl, source: "documento" }],
      };
      setCard(base);
      await sendToChat({
        displayText: `${kind === "imagen" ? "Imagen" : "Escaneo"}: ${file.name}`,
        baseCard: base,
        image: { dataUrl, kind },
        heavy,
        source: "foto",
      });
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "No se pudo leer el archivo." },
      ]);
      setBusy(false);
    }
  }

  async function handleAudio(blob: Blob) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("audio", blob, "audio.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.text) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.error ?? "No se pudo transcribir el audio.",
          },
        ]);
        setBusy(false);
        return;
      }
      await sendToChat({ displayText: data.text, source: "audio" });
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "No se pudo transcribir el audio." },
      ]);
      setBusy(false);
    }
  }

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden lg:flex-row">
      {/* Mapa + tarjeta: arriba en móvil, a la DERECHA en PC/laptop. Prioriza la info. */}
      <section className="relative h-3/5 w-full overflow-hidden lg:order-2 lg:h-full lg:w-2/3">
        <MapView lat={card.lat} lng={card.lng} />

        <div className="pointer-events-none absolute inset-0 flex items-start justify-end p-4">
          <InfoCard
            card={card}
            onChange={(patch) => setCard((c) => ({ ...c, ...patch }))}
            onClear={() => setCard(emptyCard)}
            onRemovePhoto={(i) =>
              setCard((c) => ({
                ...c,
                photos: c.photos.filter((_, idx) => idx !== i),
              }))
            }
          />
        </div>
      </section>

      {/* Chatbot: abajo en móvil, a la IZQUIERDA en PC/laptop. Más pequeño. */}
      <section className="h-2/5 w-full lg:order-1 lg:h-full lg:w-1/3">
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
