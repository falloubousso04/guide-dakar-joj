import { z } from 'zod';

/** Les sites olympiques d'où part un supporter. Liste fermée. */
export const OLYMPIC_SITES = ['dakar', 'diamniadio', 'saly'] as const;

export const olympicSiteSchema = z.enum(OLYMPIC_SITES);
export type OlympicSite = z.infer<typeof olympicSiteSchema>;

/** L'emplacement d'un lieu sur la carte. */
export const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});
export type Location = z.infer<typeof locationSchema>;

/** Un lieu faisable : le supporter peut y aller, le visiter et revenir avant son épreuve. */
export const placeSuggestionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  /** Le quartier du lieu. */
  district: z.string(),
  visitMinutes: z.number().int(),
  /** Trajet aller depuis le site du supporter. */
  travelMinutes: z.number().int(),
  /** Heure de retour au site. */
  backAt: z.iso.datetime(),
  /** Où est le lieu ; null quand on ne le connaît pas (pas de lien vers la carte). */
  location: locationSchema.nullable(),
});
export type PlaceSuggestion = z.infer<typeof placeSuggestionSchema>;
