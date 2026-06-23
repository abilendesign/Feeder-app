"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import InfoCard from "@/components/InfoCard";
import Chat, { type ChatMessage } from "@/components/Chat";
import { emptyCard, type Card } from "@/lib/schema";

type SaveState = "idle" | "saving" | "saved" | "error";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type Layout = "responsive" | "mobile" | "pc";

export default function Home() {
  const [card, setCard] = useState<Card>(emptyCard);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [hydrated, setHydrated] = useState(false);

  // Carga una card guardada (?load=id) o restaura el chat/tarjeta de localStorage.
  useEffect(() => {
    const loadId = new URLSearchParams(window.location.search).get("load");
    if (loadId) {
      (async () => {
        try {
          const res = await fetch(`/api/cards?id=${loadId}`);
          const d = await res.json();
          if (res.ok && d.card) {
            setCard({ ...emptyCard, ...d.card, photos: d.card.photos ?? [] });
            setSavedId(d.id);
            setMessages([]);
          }
        } catch {
          // si falla, queda la tarjeta vacía
        }
        window.history.replaceState({}, "", "/");
        setHydrated(true);
      })();
      return;
    }
    try {
      const c = localStorage.getItem("feeder_card");
      const m = localStorage.getItem("feeder_messages");
      const sid = localStorage.getItem("feeder_savedId");
      if (c) setCard(JSON.parse(c));
      if (m) setMessages(JSON.parse(m));
      if (sid) setSavedId(sid);
    } catch {
      // ignora datos corruptos
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("feeder_card", JSON.stringify(card));
    } catch {
      // localStorage lleno (fotos grandes): no es crítico
    }
  }, [card, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("feeder_messages", JSON.stringify(messages));
    } catch {
      // ignora
    }
  }, [messages, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (savedId) localStorage.setItem("feeder_savedId", savedId);
    else localStorage.removeItem("feeder_savedId");
  }, [savedId, hydrated]);

  async function saveCard() {
    setSaveState("saving");
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: savedId, card }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveState("error");
        return;
      }
      setSavedId(data.id);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    } catch {
      setSaveState("error");
    }
  }

  // El link feeder-celular fuerza vista móvil; feeder-pc fuerza vista PC.
  const [layout, setLayout] = useState<Layout>("responsive");
  useEffect(() => {
    const h = window.location.hostname;
    if (h.includes("celular")) setLayout("mobile");
    else if (h.includes("feeder-pc")) setLayout("pc");
  }, []);

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

  // Reduce y comprime la imagen (evita el límite de tamaño de Vercel y mejora la visión).
  function resizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("no ctx"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("img load"));
      };
      img.src = url;
    });
  }

  async function handleImage(file: File, kind: "imagen" | "escaneo") {
    setBusy(true);
    try {
      // Intenta comprimir; si falla, manda el original.
      let dataUrl: string;
      try {
        dataUrl = await resizeImage(file);
      } catch {
        dataUrl = await fileToDataUrl(file);
      }
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
      fd.append("audio", blob, blob.type.includes("wav") ? "audio.wav" : "audio.webm");
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

  const mainCls =
    layout === "mobile"
      ? "mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden"
      : layout === "pc"
        ? "flex h-[100dvh] flex-row overflow-hidden"
        : "flex h-[100dvh] flex-col overflow-hidden lg:flex-row";

  const mapCls =
    layout === "mobile"
      ? "relative h-3/5 w-full overflow-hidden"
      : layout === "pc"
        ? "relative order-2 h-full w-2/3 overflow-hidden"
        : "relative h-3/5 w-full overflow-hidden lg:order-2 lg:h-full lg:w-2/3";

  const chatCls =
    layout === "mobile"
      ? "h-2/5 w-full"
      : layout === "pc"
        ? "order-1 h-full w-1/3"
        : "h-2/5 w-full lg:order-1 lg:h-full lg:w-1/3";

  const content = (
    <main className={mainCls}>
      {/* Mapa + tarjeta */}
      <section className={mapCls}>
        <MapView lat={card.lat} lng={card.lng} />

        <Link
          href="/perfil"
          className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 hover:bg-black/80"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Perfil
        </Link>

        <div
          className={`pointer-events-none absolute inset-0 flex items-start p-4 ${
            layout === "mobile" ? "justify-center" : "justify-end"
          }`}
        >
          <InfoCard
            card={card}
            layout={layout}
            saveState={saveState}
            onSave={saveCard}
            onChange={(patch) => setCard((c) => ({ ...c, ...patch }))}
            onClear={() => {
              setCard(emptyCard);
              setSavedId(null);
            }}
            onRemovePhoto={(i) =>
              setCard((c) => ({
                ...c,
                photos: c.photos.filter((_, idx) => idx !== i),
              }))
            }
          />
        </div>
      </section>

      {/* Chatbot */}
      <section className={chatCls}>
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

  // En modo celular, encuadra la app como un teléfono (centrada).
  if (layout === "mobile") {
    return (
      <div className="flex h-[100dvh] justify-center bg-black">{content}</div>
    );
  }
  return content;
}
