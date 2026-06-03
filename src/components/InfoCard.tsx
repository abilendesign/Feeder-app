"use client";

import type { Card } from "@/lib/schema";

export default function InfoCard({
  card,
  onClear,
  onRemoveField,
}: {
  card: Card;
  onClear: () => void;
  onRemoveField: (index: number) => void;
}) {
  const hasData =
    card.documentType || card.summary || card.fields.length > 0 || card.location;

  return (
    <div className="pointer-events-auto w-[380px] max-w-[92%] overflow-hidden rounded-2xl bg-white text-black shadow-2xl ring-1 ring-black/10">
      {/* Encabezado con acento lima */}
      <div className="flex items-stretch">
        <div className="w-1.5 bg-[#d6ff00]" />
        <div className="flex flex-1 items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              {card.documentType ?? "Documento"}
            </p>
            <h2 className="truncate text-base font-bold leading-tight">
              {card.summary ?? "Información recolectada"}
            </h2>
          </div>
          <button
            onClick={onClear}
            aria-label="Eliminar tarjeta"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700"
          >
            {/* ícono papelera */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="max-h-[42vh] overflow-y-auto px-4 pb-4">
        {!hasData && (
          <p className="py-8 text-center text-sm text-neutral-400">
            Aún no hay información.<br />Empieza a chatear o sube un documento. 👇
          </p>
        )}

        {/* Campos como chips */}
        {card.fields.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {card.fields.map((f, i) => (
              <div
                key={i}
                className="group relative rounded-xl bg-neutral-100 px-3 py-2"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                  {f.label}
                </p>
                <p className="break-words pr-4 text-sm font-medium">{f.value}</p>
                <button
                  onClick={() => onRemoveField(i)}
                  aria-label="Eliminar campo"
                  className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Ubicación */}
        {card.location && (
          <div className="mt-2 flex items-start gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-white">
            <span className="mt-0.5 text-[#d6ff00]">📍</span>
            <div className="min-w-0">
              <p className="break-words text-sm font-medium">
                {card.location.address}
              </p>
              <p className="text-[11px] text-neutral-400">
                {card.location.latitude.toFixed(5)},{" "}
                {card.location.longitude.toFixed(5)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
