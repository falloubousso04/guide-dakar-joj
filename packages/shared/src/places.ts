import { z } from 'zod';

/** Les sites olympiques d'où part un supporter. Liste fermée. */
export const OLYMPIC_SITES = ['dakar', 'diamniadio', 'saly'] as const;

export const olympicSiteSchema = z.enum(OLYMPIC_SITES);
export type OlympicSite = z.infer<typeof olympicSiteSchema>;

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
});
export type PlaceSuggestion = z.infer<typeof placeSuggestionSchema>;
