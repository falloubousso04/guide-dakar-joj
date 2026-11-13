import {
  type AgendaEventResponse,
  chatRequestSchema,
  createDisciplineSchema,
  dayAgendaQuerySchema,
  GAMES_FIRST_DAY,
  GAMES_LAST_DAY,
  type DisciplineResponse,
  type ProblemDetails,
  updateDisciplineSchema,
} from '@joj/shared';
import { delay, http, HttpResponse } from 'msw';
import type { z } from 'zod';
import { mockControl } from './control';
import { fixture } from './fixture';

/**
 * La fausse API des tests du front : le même contrat que apps/api (mêmes schémas zod, mêmes
 * codes d'erreur, même format RFC 9457), sur les données de `fixture.ts`. Une nouvelle route
 * de l'API s'ajoute ici, avec son test dans `handlers.test.ts`.
 */

const TITLES: Record<number, string> = {
  400: 'Bad Request',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
};

function problem(
  status: number,
  code: string,
  detail: string,
  extra: Pick<ProblemDetails, 'errors' | 'details'> = {},
) {
  return HttpResponse.json(
    {
      type: `urn:problem-type:${code.toLowerCase().replaceAll('_', '-')}`,
      title: TITLES[status] ?? 'Error',
      status,
      code,
      detail,
      ...extra,
    } satisfies ProblemDetails,
    { status, headers: { 'content-type': 'application/problem+json' } },
  );
}

/** Latence, puis panne armée par `mockControl` : renvoie la réponse d'erreur, ou `null`. */
async function gate(method: string, path: string): Promise<Response | null> {
  if (mockControl.latency > 0) await delay(mockControl.latency);
  const failure = mockControl.takeFailure(`${method} ${path}`);
  return failure === null ? null : problem(failure.status, failure.code, 'Mocked failure.');
}

function validationFailed(error: z.ZodError) {
  return problem(400, 'VALIDATION_FAILED', 'The request is invalid.', {
    errors: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
  });
}

const notFound = (id: string) =>
  problem(404, 'DISCIPLINE_NOT_FOUND', `No discipline with id ${id}`, { details: { id } });

const nameTaken = (name: string) =>
  problem(409, 'DISCIPLINE_NAME_TAKEN', `A discipline named ${name} already exists`, {
    details: { name },
  });

const byName = (a: DisciplineResponse, b: DisciplineResponse) =>
  a.name < b.name ? -1 : a.name > b.name ? 1 : 0;

const findDiscipline = (id: string) => fixture.disciplines.find((d) => d.id === id);

/** L'ordre de l'API : heure de début, puis titre sans tenir compte de la casse, puis id. */
const byAgendaOrder = (a: AgendaEventResponse, b: AgendaEventResponse) =>
  a.startsAt.localeCompare(b.startsAt) ||
  a.title.localeCompare(b.title, 'fr', { sensitivity: 'accent' }) ||
  a.id.localeCompare(b.id);

export const handlers = [
  http.get('*/api/disciplines', async () => {
    const failure = await gate('GET', '/api/disciplines');
    if (failure) return failure;
    return HttpResponse.json([...fixture.disciplines].sort(byName));
  }),

  http.post('*/api/disciplines', async ({ request }) => {
    const failure = await gate('POST', '/api/disciplines');
    if (failure) return failure;
    const parsed = createDisciplineSchema.safeParse(await request.json());
    if (!parsed.success) return validationFailed(parsed.error);
    if (fixture.disciplines.some((d) => d.name === parsed.data.name)) {
      return nameTaken(parsed.data.name);
    }
    const created: DisciplineResponse = {
      ...parsed.data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    fixture.disciplines.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get('*/api/disciplines/:id', async ({ params }) => {
    const failure = await gate('GET', '/api/disciplines/:id');
    if (failure) return failure;
    const id = String(params['id']);
    const found = findDiscipline(id);
    return found ? HttpResponse.json(found) : notFound(id);
  }),

  http.patch('*/api/disciplines/:id', async ({ params, request }) => {
    const failure = await gate('PATCH', '/api/disciplines/:id');
    if (failure) return failure;
    const id = String(params['id']);
    const found = findDiscipline(id);
    if (!found) return notFound(id);
    const parsed = updateDisciplineSchema.safeParse(await request.json());
    if (!parsed.success) return validationFailed(parsed.error);
    const updated = { ...found, ...parsed.data };
    if (fixture.disciplines.some((d) => d.name === updated.name && d.id !== id)) {
      return nameTaken(updated.name);
    }
    fixture.disciplines = fixture.disciplines.map((d) => (d.id === id ? updated : d));
    return HttpResponse.json(updated);
  }),

  http.delete('*/api/disciplines/:id', async ({ params }) => {
    const failure = await gate('DELETE', '/api/disciplines/:id');
    if (failure) return failure;
    const id = String(params['id']);
    if (!findDiscipline(id)) return notFound(id);
    fixture.disciplines = fixture.disciplines.filter((d) => d.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // Le chatbot ne comprend pas la phrase ici : il répond `fixture.chatReply`. Les refus de l'API
  // (EVENT_TIME_PASSED, ASSISTANT_UNAVAILABLE) s'arment avec `mockControl.failNext`.
  http.post('*/api/chat', async ({ request }) => {
    const failure = await gate('POST', '/api/chat');
    if (failure) return failure;
    const parsed = chatRequestSchema.safeParse(await request.json());
    if (!parsed.success) return validationFailed(parsed.error);
    return HttpResponse.json(fixture.chatReply);
  }),

  // Une animation appartient à la journée où elle commence (heure de Dakar, UTC).
  http.get('*/api/agenda', async ({ request }) => {
    const failure = await gate('GET', '/api/agenda');
    if (failure) return failure;
    const query = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = dayAgendaQuerySchema.safeParse(query);
    if (!parsed.success) return validationFailed(parsed.error);
    const { date } = parsed.data;
    if (date < GAMES_FIRST_DAY || date > GAMES_LAST_DAY) {
      return problem(
        422,
        'AGENDA_DATE_OUTSIDE_GAMES',
        `${date} is not a day of the Games (from ${GAMES_FIRST_DAY} to ${GAMES_LAST_DAY})`,
        { details: { date } },
      );
    }
    return HttpResponse.json(
      fixture.agendaEvents.filter((event) => event.startsAt.startsWith(date)).sort(byAgendaOrder),
    );
  }),
];
