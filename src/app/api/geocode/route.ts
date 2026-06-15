import { geocode } from "@/lib/geocode";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q");
  if (!q) return Response.json({ error: "Falta q" }, { status: 400 });
  const r = await geocode(q);
  return Response.json(
    r ? { address: r.address, lat: r.latitude, lng: r.longitude } : { address: null }
  );
}
