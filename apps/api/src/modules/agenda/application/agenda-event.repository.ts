import type { AgendaEvent } from '../domain/agenda-event';

export abstract class AgendaEventRepository {
  /** Les animations dont le début est au moins `from` et avant `to`, dans un ordre quelconque. */
  abstract findStartingBetween(from: Date, to: Date): Promise<AgendaEvent[]>;
}
