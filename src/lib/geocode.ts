import type { Location } from "@/lib/schema";

/**
 * Geocoding con Nominatim (OpenStreetMap) para el MVP.
 * En producción se cambiará por Google Geocoding.
 */
export async function geocode(query: string): Promise<Location | null> {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
    encodeURIComponent(query);

  try {
    const res = await fetch(url, {
      headers: {
        // Nominatim exige un User-Agent identificable.
        "User-Agent": "FeederApp/0.1 (Abilendesign@gmail.com)",
      },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    if (!data.length) return null;

    return {
      address: data[0].display_name,
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}
