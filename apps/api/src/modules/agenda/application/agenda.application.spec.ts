import { describe, expect, it } from 'vitest';
import { AgendaEvent } from '../domain/agenda-event';
import { InMemoryAgendaEventRepository } from './testing/in-memory-agenda-event.repository';
import { GetDayAgenda } from './use-cases/get-day-agenda';

let counter = 0;
const nextId = () => `0199f5c2-0000-7000-8000-${String(++counter).padStart(12, '0')}`;

function event(title: string, startsAt: string, endsAt: string, id = nextId()) {
  return AgendaEvent.create({
    id,
    title,
    venue: 'Place de la Nation',
    district: 'Colobane',
    startsAt: new Date(startsAt),
    endsAt: new Date(endsAt),
  });
}

const agendaOf = (events: AgendaEvent[]) =>
  new GetDayAgenda(new InMemoryAgendaEventRepository(events));

describe('GetDayAgenda', () => {
  it("003-AS1: lists the day's events by start time, with their venue, district and times", async () => {
    const evening = event('Concert du soir', '2026-11-08T20:00:00Z', '2026-11-08T22:00:00Z');
    const morning = event('Fan zone matin', '2026-11-08T10:00:00Z', '2026-11-08T12:00:00Z');
    const afternoon = event('Lutte exhibition', '2026-11-08T15:00:00Z', '2026-11-08T16:30:00Z');

    const result = await agendaOf([evening, morning, afternoon]).execute('2026-11-08');

    expect(result.map((e) => e.title)).toEqual([
      'Fan zone matin',
      'Lutte exhibition',
      'Concert du soir',
    ]);
    expect(result[0]).toMatchObject({
      venue: 'Place de la Nation',
      district: 'Colobane',
      startsAt: new Date('2026-11-08T10:00:00Z'),
      endsAt: new Date('2026-11-08T12:00:00Z'),
    });
  });

  it('003-AS2: returns only the events of the chosen day', async () => {
    const result = await agendaOf([
      event('Le 7', '2026-11-07T18:00:00Z', '2026-11-07T19:00:00Z'),
      event('Le 8', '2026-11-08T18:00:00Z', '2026-11-08T19:00:00Z'),
      event('Le 9', '2026-11-09T00:00:00Z', '2026-11-09T01:00:00Z'),
    ]).execute('2026-11-08');

    expect(result.map((e) => e.title)).toEqual(['Le 8']);
  });

  it('003-AS3: returns an empty list for a Games day without events', async () => {
    const result = await agendaOf([
      event('Le 7', '2026-11-07T18:00:00Z', '2026-11-07T19:00:00Z'),
    ]).execute('2026-11-10');

    expect(result).toEqual([]);
  });

  it('003-AS4: returns the event of the first and of the last day of the Games', async () => {
    const agenda = agendaOf([
      event('Ouverture', '2026-10-31T19:00:00Z', '2026-10-31T23:00:00Z'),
      event('Clôture', '2026-11-13T19:00:00Z', '2026-11-13T23:00:00Z'),
    ]);

    expect((await agenda.execute('2026-10-31')).map((e) => e.title)).toEqual(['Ouverture']);
    expect((await agenda.execute('2026-11-13')).map((e) => e.title)).toEqual(['Clôture']);
  });

  it('003-AS5: refuses a day outside the Games', async () => {
    await expect(agendaOf([]).execute('2026-11-14')).rejects.toMatchObject({
      code: 'AGENDA_DATE_OUTSIDE_GAMES',
    });
  });

  it('003-AS8: sorts events starting at the same time by title, ignoring case, then by id', async () => {
    const fanZone = event('fan zone', '2026-11-08T15:00:00Z', '2026-11-08T18:00:00Z');
    const concert = event('Concert', '2026-11-08T15:00:00Z', '2026-11-08T17:00:00Z');
    const twinB = event('Défilé', '2026-11-08T15:00:00Z', '2026-11-08T16:00:00Z', nextId());
    const twinA = event('défilé', '2026-11-08T15:00:00Z', '2026-11-08T16:00:00Z', nextId());

    const result = await agendaOf([twinA, fanZone, twinB, concert]).execute('2026-11-08');

    // twinB a été créé avant twinA : son identifiant est plus petit.
    expect(result.map((e) => e.id)).toEqual([concert.id, twinB.id, twinA.id, fanZone.id]);
  });

  it('003-AS9: keeps an event that ends after midnight on its start day only', async () => {
    const lateConcert = event('Concert de nuit', '2026-11-08T22:00:00Z', '2026-11-09T01:00:00Z');
    const agenda = agendaOf([lateConcert]);

    expect((await agenda.execute('2026-11-08')).map((e) => e.title)).toEqual(['Concert de nuit']);
    expect(await agenda.execute('2026-11-09')).toEqual([]);
  });
});
