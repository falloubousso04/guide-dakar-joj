import { z } from 'zod';

/** Premier et dernier jour des Jeux, bornes comprises (heure de Dakar, UTC). */
export const GAMES_FIRST_DAY = '2026-10-31';
export const GAMES_LAST_DAY = '2026-11-13';

/** Requête de `GET /api/agenda` : une date réelle au format AAAA-MM-JJ. */
export const dayAgendaQuerySchema = z.object({
  date: z.iso.date({ error: 'The date is invalid: expected a real date as YYYY-MM-DD' }),
});
export type DayAgendaQuery = z.infer<typeof dayAgendaQuerySchema>;

/** Une animation telle que l'API la renvoie. */
export const agendaEventSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  /** Le lieu de l'animation. */
  venue: z.string(),
  /** Le quartier du lieu. */
  district: z.string(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
});
export type AgendaEventResponse = z.infer<typeof agendaEventSchema>;

/** Les animations d'une journée, triées par heure de début. */
export const dayAgendaSchema = z.array(agendaEventSchema);
