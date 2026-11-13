/**
 * La page /agenda, montée par sa vraie route sur la fausse API (`mocks/handlers.ts`) : les
 * animations d'une journée dans l'ordre, la journée vide, et les refus ou pannes de l'API.
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockControl } from '@/mocks/control';
import { renderRoute } from '@/test/utils';
import { defaultAgendaDay, GAMES_DAYS } from './games-days';

async function open(date?: string) {
  const user = userEvent.setup();
  const rendered = await renderRoute({
    initialEntries: [date ? `/agenda?date=${date}` : '/agenda'],
  });
  return { user, ...rendered };
}

const eventList = () => screen.findByRole('list', { name: 'Animations de la journée' });

describe('AgendaPage', () => {
  it('003-AS1: shows the day’s events by start time, with venue, district, start and end', async () => {
    await open('2026-11-08');

    const items = within(await eventList()).getAllByRole('listitem');
    expect(items.map((item) => item.getAttribute('aria-label'))).toEqual([
      'Fan zone matinale',
      'Concert de la jeunesse',
      'Démonstration de breaking',
      'Nuit du mbalax',
    ]);
    const first = items[0]!;
    expect(first).toHaveTextContent('Place de la Nation');
    expect(first).toHaveTextContent('Colobane');
    // Heures de Dakar, avec une espace insécable : « 10 h 00 ».
    expect(first).toHaveTextContent(/10\sh\s00/);
    expect(first).toHaveTextContent(/13\sh\s00/);
  });

  it('003-AS1: shows the events of the day the supporter picks', async () => {
    const { user, router } = await open('2026-11-08');
    await eventList();

    await user.selectOptions(screen.getByLabelText('Journée'), '2026-11-07');

    const items = within(await screen.findByRole('list', { name: 'Animations de la journée' }));
    expect(await items.findByRole('listitem', { name: 'Fan zone du Plateau' })).toBeInTheDocument();
    expect(items.getAllByRole('listitem')).toHaveLength(1);
    expect(router.state.location.search).toEqual({ date: '2026-11-07' });
  });

  it('003-AS3: says that no event is planned on a day without events', async () => {
    await open('2026-11-10');

    expect(
      await screen.findByText('Aucune animation n’est prévue ce jour-là.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('list', { name: 'Animations de la journée' }),
    ).not.toBeInTheDocument();
  });

  it('003-AS4: offers every Games day, opening on today during the Games, else on the first day', () => {
    expect(GAMES_DAYS).toHaveLength(14);
    expect(GAMES_DAYS[0]).toBe('2026-10-31');
    expect(GAMES_DAYS.at(-1)).toBe('2026-11-13');
    expect(defaultAgendaDay(new Date('2026-11-13T23:30:00Z'))).toBe('2026-11-13');
    expect(defaultAgendaDay(new Date('2026-11-14T00:00:00Z'))).toBe('2026-10-31');
    expect(defaultAgendaDay(new Date('2026-07-01T12:00:00Z'))).toBe('2026-10-31');
  });

  it('003-AS7: shows a readable error instead of a list when the service fails, then another day works', async () => {
    mockControl.failNext('GET /api/agenda', 503, 'INTERNAL_ERROR');
    const { user } = await open('2026-11-08');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'L’agenda de cette journée n’a pas pu s’afficher. Réessayez ou choisissez une autre journée.',
    );
    expect(
      screen.queryByRole('list', { name: 'Animations de la journée' }),
    ).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Journée'), '2026-11-07');
    expect(
      await screen.findByRole('listitem', { name: 'Fan zone du Plateau' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('003-AS7: explains a refused day outside the Games', async () => {
    mockControl.failNext('GET /api/agenda', 422, 'AGENDA_DATE_OUTSIDE_GAMES');
    await open('2026-11-08');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cette journée n’est pas pendant les Jeux. Choisissez une journée entre le 31 octobre et le 13 novembre.',
    );
    expect(screen.getByLabelText('Journée')).toBeEnabled();
  });
});
