import { ApiError } from '@/lib/api';

const UNAVAILABLE =
  'L’agenda de cette journée n’a pas pu s’afficher. Réessayez ou choisissez une autre journée.';

/** Messages affichés pour les codes d'erreur de l'API ; une autre panne dit que l'agenda n'a pas pu s'afficher. */
const ERROR_MESSAGES: Record<string, string> = {
  AGENDA_DATE_OUTSIDE_GAMES:
    'Cette journée n’est pas pendant les Jeux. Choisissez une journée entre le 31 octobre et le 13 novembre.',
};

export function agendaErrorMessage(error: unknown): string {
  return (error instanceof ApiError && ERROR_MESSAGES[error.code]) || UNAVAILABLE;
}
