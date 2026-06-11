import { reverseGeocode } from "@/lib/geocode";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ error: "Coordenadas inválidas" }, { status: 400 });
  }
  const address = await reverseGeocode(lat, lng);
  return Response.json({ address });
}
