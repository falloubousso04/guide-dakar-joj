import { ApiError } from '@/lib/api';

const UNAVAILABLE = 'Le chatbot n’a pas pu répondre. Réessayez dans un instant.';

/** Messages affichés pour les codes d'erreur de l'API ; une autre panne dit que le chatbot n'a pas répondu. */
const ERROR_MESSAGES: Record<string, string> = {
  EVENT_TIME_PASSED:
    'L’heure de votre épreuve est déjà passée. Donnez l’heure de votre prochaine épreuve.',
  ASSISTANT_UNAVAILABLE: UNAVAILABLE,
};

export function chatErrorMessage(error: unknown): string {
  return (error instanceof ApiError && ERROR_MESSAGES[error.code]) || UNAVAILABLE;
}
