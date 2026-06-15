import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/schema";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title: string | null;
  data: Card | null;
  created_at: string;
};

export default async function Perfil() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("property_cards")
    .select("id, title, data, created_at")
    .order("created_at", { ascending: false });

  const cards = (data ?? []) as Row[];
  const username = user?.email ?? "Invitado";
  const count = cards.length;

  return (
    <main className="min-h-[100dvh] bg-[#0a0a0a] text-neutral-100">
      {/* Header con botón volver */}
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 ring-1 ring-white/10 hover:bg-neutral-700"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver al chat
        </Link>
        <LogoutButton />
      </header>

      {/* Info de usuario */}
      <section className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d6ff00] text-lg font-bold text-black">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-semibold">{username}</p>
            <p className="text-xs text-neutral-400">
              {count} {count === 1 ? "propiedad guardada" : "propiedades guardadas"}
            </p>
          </div>
        </div>
      </section>

      {/* Grid de cards */}
      <section className="px-5 pb-10">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Mis propiedades
        </p>
        {count === 0 ? (
          <p className="text-sm text-neutral-500">
            Aún no has guardado ninguna propiedad. Guarda una desde el chat.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {cards.map((c) => {
              const d = c.data;
              return (
                <div
                  key={c.id}
                  className="rounded-xl bg-white p-3 text-black shadow ring-1 ring-black/10"
                >
                  <div className="mb-1 h-1 w-8 rounded bg-[#d6ff00]" />
                  <p className="truncate text-sm font-semibold">
                    {c.title || "Sin título"}
                  </p>
                  <p className="truncate text-[11px] text-neutral-500">
                    {[d?.operationType, d?.propertyType].filter(Boolean).join(" · ") ||
                      "—"}
                  </p>
                  {d?.price != null && (
                    <p className="mt-1 text-xs font-medium">
                      {d.price} {d.currency ?? ""}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
