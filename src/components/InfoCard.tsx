"use client";

import { useState } from "react";
import type { Card } from "@/lib/schema";
import { pricePerM2 } from "@/lib/schema";

type Patch = Partial<Card>;

// ---------- texto exportable de la tarjeta ----------
function cardToText(card: Card): string {
  const ppm2 = pricePerM2(card);
  const rows: [string, unknown][] = [
    ["Tipo de propiedad", card.propertyType],
    ["Operación", card.operationType],
    ["Estado del anuncio", card.listingStatus],
    ["Título", card.title],
    ["Precio", card.price != null ? `${card.price} ${card.currency ?? ""}` : null],
    ["Precio por m²", ppm2 != null ? `${ppm2} ${card.currency ?? ""}/m²` : null],
    ["Área (m²)", card.areaM2],
    ["Recámaras", card.bedrooms],
    ["Baños", card.bathrooms],
    ["Parking", card.parking],
    ["Condición", card.condition],
    ["Estado", card.status],
    ["Descripción", card.description],
    ["Dirección", card.addressText],
    ["Texto extra", card.locationExtra],
    [
      "Coordenadas",
      card.lat != null && card.lng != null ? `${card.lat}, ${card.lng}` : null,
    ],
    ["Fuente", card.sourceType],
    ["Fecha detectada", card.detectedDate],
  ];
  const body = rows
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return `TARJETA DE PROPIEDAD\n\n${body}`;
}

// ---------- íconos ----------
const ic = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg {...ic} style={{ transform: open ? "rotate(180deg)" : "none" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg {...ic}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg {...ic}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg {...ic}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ---------- campos editables reutilizables ----------
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
      {children}
    </span>
  );
}

const inputCls =
  "w-full border-b border-neutral-200 bg-transparent py-1 text-[13px] text-black outline-none placeholder:text-neutral-400 focus:border-[#a9c400]";

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder={placeholder}
        className={inputCls}
      />
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        placeholder={placeholder}
        className={inputCls}
      />
    </label>
  );
}

function AreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-md border border-neutral-200 bg-transparent p-2 text-[13px] text-black outline-none placeholder:text-neutral-400 focus:border-[#a9c400]"
      />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-black/5 px-3.5 py-2.5">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        {title}
      </p>
      {children}
    </div>
  );
}

// ---------- tarjeta ----------
export default function InfoCard({
  card,
  onChange,
  onClear,
  onRemovePhoto,
}: {
  card: Card;
  onChange: (patch: Patch) => void;
  onClear: () => void;
  onRemovePhoto: (index: number) => void;
}) {
  const ppm2 = pricePerM2(card);
  const [collapsed, setCollapsed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(cardToText(card));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // navegador sin permiso de portapapeles
    }
  }

  function download() {
    const blob = new Blob([cardToText(card)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.title || "tarjeta"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const iconBtn =
    "flex h-7 w-7 items-center justify-center rounded-lg text-neutral-600 ring-1 ring-black/10 transition hover:bg-neutral-100";

  return (
    <div className="pointer-events-auto flex max-h-[46vh] w-[340px] max-w-[92%] flex-col overflow-hidden rounded-xl bg-white text-black shadow-2xl ring-1 ring-black/10 lg:max-h-[calc(100vh-2rem)] lg:w-[380px]">
      {/* 1. HEADER */}
      <div className="flex items-stretch">
        <div className="w-1.5 bg-[#d6ff00]" />
        <div className="flex-1 px-3.5 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <input
              value={card.propertyType ?? ""}
              onChange={(e) => onChange({ propertyType: e.target.value || null })}
              placeholder="Tipo de propiedad"
              className="w-full bg-transparent text-base font-bold text-black outline-none placeholder:text-neutral-400"
            />
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Abrir tarjeta" : "Cerrar tarjeta"}
                className={iconBtn}
              >
                <ChevronIcon open={!collapsed} />
              </button>
              <button onClick={copy} aria-label="Copiar" className={iconBtn}>
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
              <button onClick={download} aria-label="Descargar" className={iconBtn}>
                <DownloadIcon />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                aria-label="Eliminar tarjeta"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <input
              value={card.operationType ?? ""}
              onChange={(e) => onChange({ operationType: e.target.value || null })}
              placeholder="Venta / Alquiler"
              className={inputCls}
            />
            <input
              value={card.listingStatus ?? ""}
              onChange={(e) => onChange({ listingStatus: e.target.value || null })}
              placeholder="Estado del anuncio"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="flex items-center justify-between gap-2 bg-red-50 px-3.5 py-2 text-xs text-red-800">
          <span>¿Eliminar toda la información de la tarjeta?</span>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => {
                onClear();
                setConfirmDelete(false);
                setCollapsed(false);
              }}
              className="rounded bg-red-600 px-2 py-1 font-medium text-white hover:bg-red-700"
            >
              Eliminar
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded bg-white px-2 py-1 font-medium ring-1 ring-black/10 hover:bg-neutral-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!collapsed && (
      <div className="overflow-y-auto">
        {/* 2. TÍTULO */}
        <Section title="Título">
          <input
            value={card.title ?? ""}
            onChange={(e) => onChange({ title: e.target.value || null })}
            placeholder="Nombre de la propiedad"
            className="w-full bg-transparent text-[13px] font-medium text-black outline-none placeholder:text-neutral-400"
          />
        </Section>

        {/* 3. PRECIO */}
        <Section title="Precio">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <NumField
                label="Precio"
                value={card.price}
                onChange={(v) => onChange({ price: v })}
                placeholder="0"
              />
            </div>
            <TextField
              label="Moneda"
              value={card.currency}
              onChange={(v) => onChange({ currency: v })}
              placeholder="USD"
            />
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Precio por m²:{" "}
            <span className="font-semibold text-black">
              {ppm2 != null ? `${ppm2} ${card.currency ?? ""}/m²` : "—"}
            </span>
          </p>
        </Section>

        {/* 4. DETALLES */}
        <Section title="Detalles">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <NumField label="Área (m²)" value={card.areaM2} onChange={(v) => onChange({ areaM2: v })} />
            <NumField label="Recámaras" value={card.bedrooms} onChange={(v) => onChange({ bedrooms: v })} />
            <NumField label="Baños" value={card.bathrooms} onChange={(v) => onChange({ bathrooms: v })} />
            <NumField label="Parking" value={card.parking} onChange={(v) => onChange({ parking: v })} />
            <TextField label="Condición" value={card.condition} onChange={(v) => onChange({ condition: v })} />
            <TextField label="Estado" value={card.status} onChange={(v) => onChange({ status: v })} />
          </div>
        </Section>

        {/* 5. DESCRIPCIÓN */}
        <Section title="Descripción">
          <AreaField
            label=""
            value={card.description}
            onChange={(v) => onChange({ description: v })}
            placeholder="Texto editable de la propiedad..."
          />
        </Section>

        {/* 6. UBICACIÓN */}
        <Section title="Ubicación">
          <div className="space-y-2">
            <TextField
              label="Dirección"
              value={card.addressText}
              onChange={(v) => onChange({ addressText: v })}
              placeholder="Dirección"
            />
            <TextField
              label="Texto extra"
              value={card.locationExtra}
              onChange={(v) => onChange({ locationExtra: v })}
              placeholder="Referencias, barrio..."
            />
            <p className="text-[11px] text-neutral-400">
              {card.lat != null && card.lng != null
                ? `Pin: ${card.lat.toFixed(5)}, ${card.lng.toFixed(5)}`
                : "Sin pin en el mapa todavía"}
            </p>
          </div>
        </Section>

        {/* 7. FOTOS */}
        <Section title="Fotos">
          {card.photos.length === 0 ? (
            <p className="text-xs text-neutral-400">Aún no hay fotos.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {card.photos.map((p, i) => (
                <div key={i} className="group relative overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`foto ${i + 1}`} className="h-16 w-full object-cover" />
                  <span className="absolute bottom-0 left-0 bg-black/60 px-1 text-[9px] text-white">
                    {p.source}
                  </span>
                  <button
                    onClick={() => onRemovePhoto(i)}
                    aria-label="Eliminar foto"
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-700"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* 8. FUENTE */}
        <Section title="Fuente">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Subido por"
              value={card.sourceType}
              onChange={(v) => onChange({ sourceType: v })}
              placeholder="foto / audio / link / chat"
            />
            <TextField
              label="Fecha detectada"
              value={card.detectedDate}
              onChange={(v) => onChange({ detectedDate: v })}
              placeholder="—"
            />
          </div>
        </Section>
      </div>
      )}
    </div>
  );
}
