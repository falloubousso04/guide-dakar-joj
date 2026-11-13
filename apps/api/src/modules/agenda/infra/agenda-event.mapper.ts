import { AgendaEvent } from '../domain/agenda-event';
import type { AgendaEventRow } from './agenda-events.schema';

export function toDomain(row: AgendaEventRow): AgendaEvent {
  return AgendaEvent.restore({
    id: row.id,
    title: row.title,
    venue: row.venue,
    district: row.district,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
  });
}

export function toRow(event: AgendaEvent): AgendaEventRow {
  return {
    id: event.id,
    title: event.title,
    venue: event.venue,
    district: event.district,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
  };
}
