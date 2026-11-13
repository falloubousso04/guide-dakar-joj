import { GAMES_FIRST_DAY, GAMES_LAST_DAY } from '@joj/shared';
import { agendaDateOutsideGames } from './agenda.errors';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Une journée des Jeux. Dakar est en UTC toute l'année : la journée va de minuit UTC inclus
 * à minuit UTC le lendemain exclu.
 */
export class AgendaDay {
  private constructor(
    readonly date: string,
    readonly start: Date,
    readonly end: Date,
  ) {}

  /** `date` au format AAAA-MM-JJ ; le domaine revérifie qu'elle est pendant les Jeux. */
  static of(date: string): AgendaDay {
    // Le format AAAA-MM-JJ se compare comme du texte, dans l'ordre du calendrier.
    if (date < GAMES_FIRST_DAY || date > GAMES_LAST_DAY) {
      throw agendaDateOutsideGames(date);
    }
    const start = new Date(`${date}T00:00:00.000Z`);
    return new AgendaDay(date, start, new Date(start.getTime() + DAY_MS));
  }
}
