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
    <div className="pointer-events-auto w-[360px] max-w-[90%] overflow-hidden rounded-xl bg-white text-black shadow-2xl ring-1 ring-black/10">
      {/* Encabezado */}
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            {card.documentType ?? "Documento"}
          </p>
          <h2 className="truncate text-base font-semibold">
            {card.summary ?? "Información recolectada"}
          </h2>
        </div>
        <button
          onClick={onClear}
          className="shrink-0 rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700"
        >
          Eliminar
        </button>
      </div>

      {/* Cuerpo */}
      <div className="max-h-[40vh] overflow-y-auto px-4 py-3">
        {!hasData && (
          <p className="py-6 text-center text-sm text-neutral-400">
            Aún no hay información. Empieza a chatear abajo. 👇
          </p>
        )}

        {card.fields.length > 0 && (
          <dl className="divide-y divide-black/5">
            {card.fields.map((f, i) => (
              <div
                key={i}
                className="group flex items-start justify-between gap-3 py-2"
              >
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-neutral-500">
                    {f.label}
                  </dt>
                  <dd className="break-words text-sm">{f.value}</dd>
                </div>
                <button
                  onClick={() => onRemoveField(i)}
                  className="mt-1 shrink-0 text-xs font-medium text-red-600 opacity-0 transition group-hover:opacity-100 hover:underline"
                  aria-label="Eliminar campo"
                >
                  ✕
                </button>
              </div>
            ))}
          </dl>
        )}

        {card.location && (
          <div className="mt-3 rounded-lg bg-neutral-100 px-3 py-2">
            <p className="text-xs font-medium text-neutral-500">Ubicación</p>
            <p className="text-sm">{card.location.address}</p>
            <p className="text-xs text-neutral-400">
              {card.location.latitude.toFixed(5)},{" "}
              {card.location.longitude.toFixed(5)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
