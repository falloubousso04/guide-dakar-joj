import { GAMES_FIRST_DAY, GAMES_LAST_DAY } from '@joj/shared';

const DAY_MS = 24 * 60 * 60 * 1000;

/** `Date` → AAAA-MM-JJ, à l'heure de Dakar (UTC toute l'année). */
const toDay = (date: Date) => date.toISOString().slice(0, 10);

function listGamesDays(): string[] {
  const days: string[] = [];
  const last = new Date(`${GAMES_LAST_DAY}T00:00:00Z`).getTime();
  for (let t = new Date(`${GAMES_FIRST_DAY}T00:00:00Z`).getTime(); t <= last; t += DAY_MS) {
    days.push(toDay(new Date(t)));
  }
  return days;
}

/** Les journées des Jeux, du premier au dernier jour compris, au format AAAA-MM-JJ. */
export const GAMES_DAYS: readonly string[] = listGamesDays();

/** La journée affichée à l'ouverture : aujourd'hui si c'est pendant les Jeux, sinon le premier jour. */
export function defaultAgendaDay(today: Date): string {
  const day = toDay(today);
  return GAMES_DAYS.includes(day) ? day : GAMES_FIRST_DAY;
}

const dayLabel = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** `2026-11-08` → « dimanche 8 novembre ». */
export function formatGamesDay(day: string): string {
  return dayLabel.format(new Date(`${day}T00:00:00Z`));
}
