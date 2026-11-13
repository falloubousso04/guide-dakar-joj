/**
 * La fausse API tient le même contrat que apps/api : si elle s'en écarte, les tests du front
 * passent contre une API qui n'existe pas. Ces tests l'appellent avec `fetch`, sans React.
 */
import { chatResponseSchema, dayAgendaSchema } from '@joj/shared';
import { describe, expect, it } from 'vitest';
import { mockControl } from './control';
import {
  askEventTimeReply,
  fanZoneMatinale,
  fixture,
  lutte,
  natation,
  placesReply,
  UNKNOWN_ID,
} from './fixture';

const call = (path: string, init: RequestInit = {}) =>
  fetch(`http://localhost${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init.headers },
  });

const json = (body: unknown) => JSON.stringify(body);

describe('mock disciplines API', () => {
  it('000-AS5: lists the disciplines sorted by name', async () => {
    const response = await call('/api/disciplines');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([lutte, natation]);
  });

  it('000-AS1: creates a discipline, then lists it', async () => {
    const created = await call('/api/disciplines', {
      method: 'POST',
      body: json({ name: 'Escrime', category: 'sports-de-combat' }),
    });
    expect(created.status).toBe(201);
    expect(await created.json()).toMatchObject({ name: 'Escrime', category: 'sports-de-combat' });

    const names = ((await (await call('/api/disciplines')).json()) as { name: string }[]).map(
      (d) => d.name,
    );
    expect(names).toEqual(['Escrime', 'Lutte', 'Natation']);
  });

  it('000-AS2: rejects an empty name with a 400 VALIDATION_FAILED problem', async () => {
    const response = await call('/api/disciplines', {
      method: 'POST',
      body: json({ name: '', category: 'athletisme' }),
    });
    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toContain('application/problem+json');
    expect(await response.json()).toMatchObject({
      code: 'VALIDATION_FAILED',
      errors: [expect.objectContaining({ path: 'name' })],
    });
  });

  it('000-AS4: rejects a taken name with a 409 DISCIPLINE_NAME_TAKEN problem', async () => {
    const response = await call('/api/disciplines', {
      method: 'POST',
      body: json({ name: 'Lutte', category: 'sports-de-combat' }),
    });
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ code: 'DISCIPLINE_NAME_TAKEN' });
  });

  it('000-AS6: returns one discipline by id', async () => {
    const response = await call(`/api/disciplines/${lutte.id}`);
    expect(await response.json()).toEqual(lutte);
  });

  it('000-AS7: updates only the fields sent', async () => {
    const response = await call(`/api/disciplines/${lutte.id}`, {
      method: 'PATCH',
      body: json({ name: 'Lutte sénégalaise' }),
    });
    expect(await response.json()).toEqual({ ...lutte, name: 'Lutte sénégalaise' });
  });

  it('000-AS9: rejects a rename to the name of another discipline with a 409', async () => {
    const response = await call(`/api/disciplines/${lutte.id}`, {
      method: 'PATCH',
      body: json({ name: 'Natation' }),
    });
    expect(response.status).toBe(409);
  });

  it('000-AS10: deletes a discipline with a 204', async () => {
    const response = await call(`/api/disciplines/${lutte.id}`, { method: 'DELETE' });
    expect(response.status).toBe(204);
    expect((await call(`/api/disciplines/${lutte.id}`)).status).toBe(404);
  });

  it.each(['GET', 'PATCH', 'DELETE'])(
    '000-AS11: answers %s on an unknown id with a 404 DISCIPLINE_NOT_FOUND problem',
    async (method) => {
      const response = await call(`/api/disciplines/${UNKNOWN_ID}`, {
        method,
        ...(method === 'PATCH' ? { body: json({ name: 'X' }) } : {}),
      });
      expect(response.status).toBe(404);
      expect(await response.json()).toMatchObject({ code: 'DISCIPLINE_NOT_FOUND' });
    },
  );
});

describe('mock chat API', () => {
  const ask = (messages: unknown) =>
    call('/api/chat', { method: 'POST', body: json({ messages }) });

  it('001-AS10: answers with the reply, the places and the missing info of the fixture', async () => {
    const response = await ask([{ role: 'user', content: 'Je suis à Diamniadio, match à 17 h' }]);
    expect(response.status).toBe(200);
    expect(chatResponseSchema.parse(await response.json())).toEqual(placesReply);
  });

  it('answers with the reply a test puts in the fixture', async () => {
    fixture.chatReply = askEventTimeReply;
    const response = await ask([{ role: 'user', content: 'Je suis à Diamniadio' }]);
    expect(await response.json()).toEqual(askEventTimeReply);
  });

  it('001-AS11: rejects a blank message with a 400 VALIDATION_FAILED problem', async () => {
    const response = await ask([{ role: 'user', content: '   ' }]);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      code: 'VALIDATION_FAILED',
      errors: [expect.objectContaining({ path: 'messages.0.content' })],
    });
  });

  it('001-AS8: answers 422 EVENT_TIME_PASSED when mockControl arms it', async () => {
    mockControl.failNext('POST /api/chat', 422, 'EVENT_TIME_PASSED');
    const response = await ask([{ role: 'user', content: 'Mon épreuve était à 10 h' }]);
    expect(response.status).toBe(422);
    expect(response.headers.get('content-type')).toContain('application/problem+json');
    expect(await response.json()).toMatchObject({ status: 422, code: 'EVENT_TIME_PASSED' });
  });

  it('001-AS9: answers 503 ASSISTANT_UNAVAILABLE when mockControl arms it', async () => {
    mockControl.failNext('POST /api/chat', 503, 'ASSISTANT_UNAVAILABLE');
    const response = await ask([{ role: 'user', content: 'Bonjour' }]);
    expect(response.status).toBe(503);
    expect(response.headers.get('content-type')).toContain('application/problem+json');
    expect(await response.json()).toMatchObject({ status: 503, code: 'ASSISTANT_UNAVAILABLE' });
  });
});

describe('mockControl', () => {
  it('fails the next request only, then answers normally', async () => {
    mockControl.failNext('GET /api/disciplines', 503);
    expect((await call('/api/disciplines')).status).toBe(503);
    expect((await call('/api/disciplines')).status).toBe(200);
  });

  it('keeps failing until reset when the failure is persistent', async () => {
    mockControl.failPersistently('DELETE /api/disciplines/:id');
    expect((await call(`/api/disciplines/${lutte.id}`, { method: 'DELETE' })).status).toBe(500);
    expect((await call(`/api/disciplines/${lutte.id}`, { method: 'DELETE' })).status).toBe(500);
    mockControl.reset();
    expect((await call(`/api/disciplines/${lutte.id}`, { method: 'DELETE' })).status).toBe(204);
  });

  it('restores the original data on reset', async () => {
    await call(`/api/disciplines/${lutte.id}`, { method: 'DELETE' });
    mockControl.reset();
    expect(await (await call('/api/disciplines')).json()).toEqual([lutte, natation]);
  });
});

describe('mock agenda API', () => {
  it("003-AS1: lists the day's events sorted by start time, then by title", async () => {
    const response = await call('/api/agenda?date=2026-11-08');
    expect(response.status).toBe(200);
    const agenda = dayAgendaSchema.parse(await response.json());
    expect(agenda.map((event) => event.title)).toEqual([
      'Fan zone matinale',
      'Concert de la jeunesse',
      'Démonstration de breaking',
      'Nuit du mbalax',
    ]);
    expect(agenda[0]).toEqual(fanZoneMatinale);
  });

  it('003-AS3: returns an empty list for a Games day without events', async () => {
    const response = await call('/api/agenda?date=2026-11-10');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  it.each(['2026-10-30', '2026-11-14'])(
    '003-AS5: refuses a day outside the Games (%s) with 422',
    async (date) => {
      const response = await call(`/api/agenda?date=${date}`);
      expect(response.status).toBe(422);
      expect(await response.json()).toMatchObject({
        code: 'AGENDA_DATE_OUTSIDE_GAMES',
        details: { date },
      });
    },
  );

  it.each(['?date=2026-13-45', '?date=demain', ''])(
    '003-AS6: refuses an unreadable or missing date (%j) with 400',
    async (query) => {
      const response = await call(`/api/agenda${query}`);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toMatchObject({ code: 'VALIDATION_FAILED' });
      expect(body.errors).toEqual([expect.objectContaining({ path: 'date' })]);
    },
  );
});
