import { Inject, Injectable } from '@nestjs/common';
import { and, gte, lt } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { AgendaEventRepository } from '../application/agenda-event.repository';
import type { AgendaEvent } from '../domain/agenda-event';
import { toDomain } from './agenda-event.mapper';
import { agendaEvents } from './agenda-events.schema';

@Injectable()
export class DrizzleAgendaEventRepository extends AgendaEventRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async findStartingBetween(from: Date, to: Date): Promise<AgendaEvent[]> {
    // Début inclus, fin exclue : une animation à minuit pile appartient à la journée qui commence.
    const rows = await this.db
      .select()
      .from(agendaEvents)
      .where(and(gte(agendaEvents.startsAt, from), lt(agendaEvents.startsAt, to)));
    return rows.map(toDomain);
  }
}
