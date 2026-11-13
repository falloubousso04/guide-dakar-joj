import { Injectable } from '@nestjs/common';
import { AgendaDay } from '../../domain/agenda-day';
import { type AgendaEvent, compareAgendaEvents } from '../../domain/agenda-event';
import { AgendaEventRepository } from '../agenda-event.repository';

@Injectable()
export class GetDayAgenda {
  constructor(private readonly events: AgendaEventRepository) {}

  /** `date` au format AAAA-MM-JJ ; refuse une journée hors des Jeux. */
  async execute(date: string): Promise<AgendaEvent[]> {
    const day = AgendaDay.of(date);
    const events = await this.events.findStartingBetween(day.start, day.end);
    return events.sort(compareAgendaEvents);
  }
}
