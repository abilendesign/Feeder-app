import { z } from "zod";

/** Foto asociada a la tarjeta (de documento o agregada por el usuario). */
export type Photo = {
  url: string;
  source: "documento" | "usuario";
};

/** La tarjeta de propiedad (editable por el usuario). */
export type Card = {
  // Header
  propertyType: string | null; // Tipo de propiedad
  listingStatus: string | null; // Estado del anuncio
  operationType: string | null; // Venta | Alquiler
  // Título
  title: string | null;
  // Precio
  price: number | null;
  currency: string | null;
  // Detalles
  areaM2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  condition: string | null;
  status: string | null;
  // Descripción
  description: string | null;
  // Ubicación
  addressText: string | null;
  locationExtra: string | null;
  lat: number | null;
  lng: number | null;
  // Fotos
  photos: Photo[];
  // Fuente
  sourceType: string | null; // foto | audio | link | chat
  detectedDate: string | null;
};

export const emptyCard: Card = {
  propertyType: null,
  listingStatus: null,
  operationType: null,
  title: null,
  price: null,
  currency: "USD",
  areaM2: null,
  bedrooms: null,
  bathrooms: null,
  parking: null,
  condition: null,
  status: null,
  description: null,
  addressText: null,
  locationExtra: null,
  lat: null,
  lng: null,
  photos: [],
  sourceType: null,
  detectedDate: null,
};

/** Lo que devuelve la IA en cada turno (se geocodifica en el servidor). */
export const PropertyExtractionSchema = z.object({
  assistantMessage: z.string().describe("Respuesta breve del asistente, en español"),
  propertyType: z.string().nullable().describe("casa, apartamento, terreno, local, etc."),
  listingStatus: z.string().nullable().describe("borrador, activo, vendido, alquilado..."),
  operationType: z.string().nullable().describe("venta o alquiler"),
  title: z.string().nullable().describe("nombre/título de la propiedad"),
  price: z.number().nullable(),
  currency: z.string().nullable().describe("moneda, ej. USD"),
  areaM2: z.number().nullable().describe("área en metros cuadrados"),
  bedrooms: z.number().nullable(),
  bathrooms: z.number().nullable(),
  parking: z.number().nullable(),
  condition: z.string().nullable().describe("nuevo, usado, a estrenar..."),
  status: z.string().nullable().describe("otro estado físico relevante"),
  description: z.string().nullable(),
  addressText: z.string().nullable().describe("dirección"),
  locationExtra: z.string().nullable().describe("referencias o texto extra de ubicación"),
  locationQuery: z.string().nullable().describe("mejor dirección/lugar para ubicar en el mapa"),
  detectedDate: z.string().nullable().describe("fecha detectada en el documento, si hay"),
});

export type PropertyExtraction = z.infer<typeof PropertyExtractionSchema>;

/** Precio por m² automático. */
export function pricePerM2(card: Card): number | null {
  if (card.price && card.areaM2 && card.areaM2 > 0) {
    return Math.round((card.price / card.areaM2) * 100) / 100;
  }
  return null;
}
