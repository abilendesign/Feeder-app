import { z } from "zod";

/** Una ubicación geográfica con su dirección y coordenadas exactas. */
export const LocationSchema = z.object({
  address: z.string().describe("Dirección legible de la ubicación"),
  latitude: z.number(),
  longitude: z.number(),
});

/** Un campo genérico extraído del documento o de la conversación. */
export const FieldSchema = z.object({
  label: z.string().describe("Nombre del campo, ej: 'Nombre', 'Monto', 'Fecha'"),
  value: z.string().describe("Valor del campo"),
});

/** La tarjeta de información que se va rellenando. */
export const CardSchema = z.object({
  documentType: z.string().nullable().describe("Tipo de documento detectado"),
  summary: z.string().nullable().describe("Resumen corto de la información"),
  fields: z.array(FieldSchema).describe("Campos extraídos"),
  location: LocationSchema.nullable().describe("Ubicación exacta, si aplica"),
});

/**
 * Lo que el modelo devuelve en cada turno. No pedimos lat/lng directo
 * (el modelo las inventaría): pedimos un `locationQuery` y el servidor
 * lo geocodifica con Nominatim.
 */
export const ExtractionSchema = z.object({
  assistantMessage: z
    .string()
    .describe("Respuesta del asistente para el usuario, en español"),
  documentType: z.string().nullable(),
  summary: z.string().nullable(),
  fields: z.array(FieldSchema),
  locationQuery: z
    .string()
    .nullable()
    .describe("Dirección o lugar a ubicar en el mapa, o null si no aplica"),
});

export type Location = z.infer<typeof LocationSchema>;
export type Field = z.infer<typeof FieldSchema>;
export type Card = z.infer<typeof CardSchema>;
export type Extraction = z.infer<typeof ExtractionSchema>;

export const emptyCard: Card = {
  documentType: null,
  summary: null,
  fields: [],
  location: null,
};
