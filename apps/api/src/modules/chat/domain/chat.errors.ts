import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const CHAT_ERROR_KINDS = {
  /** L'heure de l'épreuve est avant l'heure actuelle (l'épreuve est le jour même). */
  EVENT_TIME_PASSED: 'BUSINESS_RULE',
  /** Claude n'a pas répondu, ou aucune clé n'est configurée. */
  ASSISTANT_UNAVAILABLE: 'UNAVAILABLE',
} as const satisfies Record<string, ErrorKind>;

export type ChatErrorCode = keyof typeof CHAT_ERROR_KINDS;

export class ChatError extends AppError<ChatErrorCode> {
  constructor(code: ChatErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, CHAT_ERROR_KINDS[code], message, details);
  }
}

export function eventTimePassed(eventTime: Date, now: Date): ChatError {
  return new ChatError('EVENT_TIME_PASSED', 'The event time has already passed', {
    eventTime: eventTime.toISOString(),
    now: now.toISOString(),
  });
}

export function assistantUnavailable(): ChatError {
  return new ChatError('ASSISTANT_UNAVAILABLE', 'The chatbot could not answer, try again');
}
