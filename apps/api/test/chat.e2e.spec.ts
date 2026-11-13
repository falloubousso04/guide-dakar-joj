// Prouve le contrat de POST /api/chat : statut et corps, avec le faux assistant et de faux lieux.
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { chatResponseSchema, type PlaceSuggestion } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { AppConfig } from '../src/core/config/app-config';
import { Clock } from '../src/modules/chat/application/clock';
import { ReachablePlaces } from '../src/modules/chat/application/reachable-places';
import { FakeReachablePlaces } from '../src/modules/chat/application/testing/fake-reachable-places';
import { FakeTouristAssistant } from '../src/modules/chat/application/testing/fake-tourist-assistant';
import { TouristAssistant } from '../src/modules/chat/application/tourist-assistant';

const NOW = new Date('2026-11-07T11:30:00Z');
const EVENT_TIME = new Date('2026-11-07T17:00:00Z');

const goree: PlaceSuggestion = {
  id: '0199f5c2-0000-7000-8000-000000000001',
  name: 'Île de Gorée',
  district: 'Gorée',
  visitMinutes: 120,
  travelMinutes: 75,
  backAt: '2026-11-07T16:00:00.000Z',
  location: null,
};

const message = {
  role: 'user',
  content: 'je suis à Diamniadio, il est 11 h 30, mon match est à 17 h',
};

describe('/api/chat (e2e)', () => {
  let app: INestApplication;
  let assistant: FakeTouristAssistant;
  let reachablePlaces: FakeReachablePlaces;
  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    assistant = new FakeTouristAssistant();
    reachablePlaces = new FakeReachablePlaces();
    // Aucun test n'appelle Claude : l'IA, les lieux et l'horloge sont remplacés par des faux.
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AppConfig)
      .useValue(AppConfig.fromEnv({ NODE_ENV: 'test', PGLITE_DATA_DIR: 'memory://' }))
      .overrideProvider(TouristAssistant)
      .useValue(assistant)
      .overrideProvider(ReachablePlaces)
      .useValue(reachablePlaces)
      .overrideProvider(Clock)
      .useValue({ now: () => NOW })
      .compile();
    app = moduleRef.createNestApplication({ logger: ['error'] });
    configureApp(app);
    await app.init();
  });

  afterAll(() => app?.close());

  beforeEach(() => {
    assistant.down = false;
    assistant.replyText = 'Tu as le temps de visiter Gorée.';
    assistant.request = { site: 'diamniadio', eventTime: EVENT_TIME, now: NOW };
    reachablePlaces.places = [goree];
  });

  it('001-AS1: answers with a reply and the reachable places (200)', async () => {
    const response = await api()
      .post('/api/chat')
      .send({ messages: [message] })
      .expect(200);

    expect(chatResponseSchema.parse(response.body)).toEqual({
      reply: 'Tu as le temps de visiter Gorée.',
      places: [goree],
      missing: [],
    });
  });

  it('001-AS8: rejects an event time already passed (422, EVENT_TIME_PASSED)', async () => {
    assistant.request = {
      site: 'diamniadio',
      eventTime: new Date('2026-11-07T10:00:00Z'),
      now: NOW,
    };

    const response = await api()
      .post('/api/chat')
      .send({ messages: [{ role: 'user', content: 'il est 11 h 30, mon épreuve était à 10 h' }] })
      .expect(422);

    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 422, code: 'EVENT_TIME_PASSED' });
  });

  it('001-AS9: reports the assistant as unavailable (503, ASSISTANT_UNAVAILABLE)', async () => {
    assistant.down = true;

    const response = await api()
      .post('/api/chat')
      .send({ messages: [message] })
      .expect(503);

    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 503, code: 'ASSISTANT_UNAVAILABLE' });
    expect(response.body).not.toHaveProperty('places');
  });

  it('001-AS11: rejects a blank message (400, RFC 9457)', async () => {
    const response = await api()
      .post('/api/chat')
      .send({ messages: [{ role: 'user', content: '   ' }] })
      .expect(400);

    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
  });
});
