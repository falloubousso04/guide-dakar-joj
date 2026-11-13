import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { AgendaDay } from '../domain/agenda-day';
import { AgendaEvent } from '../domain/agenda-event';
import { toRow } from './agenda-event.mapper';
import { agendaEvents } from './agenda-events.schema';
import { DrizzleAgendaEventRepository } from './drizzle-agenda-event.repository';

const newEvent = (title: string, startsAt: string, endsAt: string) =>
  AgendaEvent.create({
    id: randomUUID(),
    title,
    venue: 'Monument de la Renaissance',
    district: 'Ouakam',
    startsAt: new Date(startsAt),
    endsAt: new Date(endsAt),
  });

describe('DrizzleAgendaEventRepository (in-memory PGlite, migrations applied)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzleAgendaEventRepository;

  // Le port n'écrit pas : les animations sont insérées directement dans la table.
  const insert = (...events: AgendaEvent[]) =>
    connection.db.insert(agendaEvents).values(events.map(toRow));

  const titlesOn = async (date: string) => {
    const day = AgendaDay.of(date);
    const events = await repository.findStartingBetween(day.start, day.end);
    return events.map((event) => event.title).sort();
  };

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    repository = new DrizzleAgendaEventRepository(connection.db);
  });

  afterAll(() => connection?.close());

  it('003-AS2: reads only the events that start on the chosen day, and reads them back whole', async () => {
    const onThe8th = newEvent('Le 8', '2026-11-08T00:00:00.000Z', '2026-11-08T02:00:00.000Z');
    await insert(
      newEvent('Le 7', '2026-11-07T23:59:59.999Z', '2026-11-08T01:00:00.000Z'),
      onThe8th,
      newEvent('Le 9', '2026-11-09T00:00:00.000Z', '2026-11-09T01:00:00.000Z'),
    );

    const day = AgendaDay.of('2026-11-08');
    expect(await repository.findStartingBetween(day.start, day.end)).toEqual([onThe8th]);
  });

  it('003-AS9: keeps an event that ends after midnight on its start day', async () => {
    await insert(
      newEvent('Concert de nuit', '2026-11-10T22:00:00.000Z', '2026-11-11T01:00:00.000Z'),
    );

    expect(await titlesOn('2026-11-10')).toEqual(['Concert de nuit']);
    expect(await titlesOn('2026-11-11')).toEqual([]);
  });
});
