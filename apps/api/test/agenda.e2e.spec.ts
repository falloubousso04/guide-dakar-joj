// Prouve le contrat de GET /api/agenda : statut et corps, sur une base PGlite neuve.
import type { INestApplication } from '@nestjs/common';
import { dayAgendaSchema, problemDetailsSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Database } from '../src/core/database/database';
import { DATABASE } from '../src/core/database/database.module';
import { agendaEvents } from '../src/modules/agenda/infra/agenda-events.schema';
import { createTestApp } from './create-test-app';

const row = (id: number, title: string, startsAt: string, endsAt: string) => ({
  id: `0199f5c2-0000-7000-8000-${String(id).padStart(12, '0')}`,
  title,
  venue: 'Place de la Nation',
  district: 'Colobane',
  startsAt: new Date(startsAt),
  endsAt: new Date(endsAt),
});

describe('/api/agenda (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
    // L'API ne crée pas d'animation : elles sont insérées directement dans la table.
    await app
      .get<Database>(DATABASE)
      .insert(agendaEvents)
      .values([
        row(1, 'Concert du soir', '2026-11-08T20:00:00.000Z', '2026-11-08T22:00:00.000Z'),
        row(2, 'Fan zone matin', '2026-11-08T10:00:00.000Z', '2026-11-08T12:00:00.000Z'),
        row(3, 'Lutte exhibition', '2026-11-08T15:00:00.000Z', '2026-11-08T16:30:00.000Z'),
        row(4, 'La veille', '2026-11-07T15:00:00.000Z', '2026-11-07T16:00:00.000Z'),
      ]);
  });

  afterAll(() => app?.close());

  it("003-AS1: returns the day's events sorted, with venue, district and times (200)", async () => {
    const response = await api().get('/api/agenda').query({ date: '2026-11-08' }).expect(200);

    const agenda = dayAgendaSchema.parse(response.body);
    expect(agenda.map((event) => event.title)).toEqual([
      'Fan zone matin',
      'Lutte exhibition',
      'Concert du soir',
    ]);
    expect(agenda[0]).toEqual({
      id: '0199f5c2-0000-7000-8000-000000000002',
      title: 'Fan zone matin',
      venue: 'Place de la Nation',
      district: 'Colobane',
      startsAt: '2026-11-08T10:00:00.000Z',
      endsAt: '2026-11-08T12:00:00.000Z',
    });
  });

  it.each(['2026-10-30', '2026-11-14'])(
    '003-AS5: refuses a day outside the Games (%s) (422, RFC 9457)',
    async (date) => {
      const response = await api().get('/api/agenda').query({ date }).expect(422);

      expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
      expect(problemDetailsSchema.parse(response.body)).toMatchObject({
        status: 422,
        code: 'AGENDA_DATE_OUTSIDE_GAMES',
        details: { date },
      });
      expect(Array.isArray(response.body)).toBe(false);
    },
  );

  it.each([{ date: '2026-13-45' }, { date: 'demain' }, {}])(
    '003-AS6: refuses an unreadable or missing date (%j) (400, RFC 9457)',
    async (query) => {
      const response = await api().get('/api/agenda').query(query).expect(400);

      expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
      expect(problemDetailsSchema.parse(response.body)).toMatchObject({
        status: 400,
        code: 'VALIDATION_FAILED',
      });
      expect(response.body.errors).toEqual([
        expect.objectContaining({
          path: 'date',
          message: expect.stringMatching(/date is invalid/),
        }),
      ]);
    },
  );
});
