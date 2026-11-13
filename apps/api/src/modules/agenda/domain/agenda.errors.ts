import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const AGENDA_ERROR_KINDS = {
  /** La journée demandée n'est pas pendant les Jeux. */
  AGENDA_DATE_OUTSIDE_GAMES: 'BUSINESS_RULE',
} as const satisfies Record<string, ErrorKind>;

export type AgendaErrorCode = keyof typeof AGENDA_ERROR_KINDS;

export class AgendaError extends AppError<AgendaErrorCode> {
  constructor(code: AgendaErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, AGENDA_ERROR_KINDS[code], message, details);
  }
}

export function agendaDateOutsideGames(date: string): AgendaError {
  return new AgendaError(
    'AGENDA_DATE_OUTSIDE_GAMES',
    `${date} is not a day of the Games (from 2026-10-31 to 2026-11-13)`,
    { date },
  );
}
