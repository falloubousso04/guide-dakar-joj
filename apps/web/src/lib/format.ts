// Espace insécable : « 14 h 10 » ne se coupe pas en fin de ligne.
const NBSP = ' ';

/** `50` → « 50 min », `60` → « 1 h », `90` → « 1 h 30 ». */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}${NBSP}min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? `${hours}${NBSP}h`
    : `${hours}${NBSP}h${NBSP}${String(rest).padStart(2, '0')}`;
}

// Les épreuves ont lieu au Sénégal : l'heure s'affiche à l'heure de Dakar, même si le téléphone
// du supporter est resté à l'heure de son pays.
const dakarClock = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Africa/Dakar',
  hour: 'numeric',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** `2026-11-07T14:10:00.000Z` → « 14 h 10 ». */
export function formatClock(iso: string): string {
  const parts = dakarClock.formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  return `${part('hour')}${NBSP}h${NBSP}${part('minute')}`;
}
