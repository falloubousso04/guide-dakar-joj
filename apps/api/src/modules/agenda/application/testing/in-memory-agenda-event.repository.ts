import type { AgendaEvent } from '../../domain/agenda-event';
import { AgendaEventRepository } from '../agenda-event.repository';

export class InMemoryAgendaEventRepository extends AgendaEventRepository {
  constructor(private readonly events: AgendaEvent[] = []) {
    super();
  }

  async findStartingBetween(from: Date, to: Date): Promise<AgendaEvent[]> {
    return this.events.filter((event) => event.startsAt >= from && event.startsAt < to);
  }
}
