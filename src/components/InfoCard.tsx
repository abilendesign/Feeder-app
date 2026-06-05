"use client";

import type { Card } from "@/lib/schema";
import { pricePerM2 } from "@/lib/schema";

type Patch = Partial<Card>;

// ---------- campos editables reutilizables ----------
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
      {children}
    </span>
  );
}

const inputCls =
  "w-full border-b border-neutral-200 bg-transparent py-1 text-sm text-black outline-none placeholder:text-neutral-400 focus:border-[#a9c400]";

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
        className="w-full resize-none rounded-md border border-neutral-200 bg-transparent p-2 text-sm text-black outline-none placeholder:text-neutral-400 focus:border-[#a9c400]"
      />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-black/5 px-4 py-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
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

  return (
    <div className="pointer-events-auto flex max-h-[46vh] w-[400px] max-w-[92%] flex-col overflow-hidden rounded-2xl bg-white text-black shadow-2xl ring-1 ring-black/10">
      {/* 1. HEADER */}
      <div className="flex items-stretch">
        <div className="w-1.5 bg-[#d6ff00]" />
        <div className="flex-1 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <input
              value={card.propertyType ?? ""}
              onChange={(e) => onChange({ propertyType: e.target.value || null })}
              placeholder="Tipo de propiedad"
              className="w-full bg-transparent text-base font-bold text-black outline-none placeholder:text-neutral-400"
            />
            <button
              onClick={onClear}
              aria-label="Eliminar tarjeta"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
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

      <div className="overflow-y-auto">
        {/* 2. TÍTULO */}
        <Section title="Título">
          <input
            value={card.title ?? ""}
            onChange={(e) => onChange({ title: e.target.value || null })}
            placeholder="Nombre de la propiedad"
            className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-neutral-400"
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
                  <img src={p.url} alt={`foto ${i + 1}`} className="h-20 w-full object-cover" />
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
    </div>
  );
}
