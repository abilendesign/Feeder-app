import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/schema";

export const runtime = "nodejs";

// Trae una card por id (para abrirla y editarla).
export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Falta id" }, { status: 400 });

  const { data, error } = await supabase
    .from("property_cards")
    .select("id, data")
    .eq("id", id)
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ id: data.id, card: data.data });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id, card } = (await req.json()) as { id?: string; card: Card };

  // No guardamos las fotos base64 en la fila (irían a Storage luego).
  const data = { ...card, photos: [] };
  const title = card.title || card.propertyType || "Sin título";

  if (id) {
    const { error } = await supabase
      .from("property_cards")
      .update({ title, data })
      .eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ id });
  }

  const { data: row, error } = await supabase
    .from("property_cards")
    .insert({ title, data })
    .select("id")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ id: row.id });
}
