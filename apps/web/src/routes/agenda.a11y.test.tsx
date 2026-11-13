/**
 * Un audit axe-core de chaque état de l'agenda : liste des animations, journée vide et
 * message d'erreur. Un état qui n'est jamais audité peut régresser sans bruit.
 */
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mockControl } from '@/mocks/control';
import { axeFindings, runAxe } from '@/test/axe';
import { renderRoute } from '@/test/utils';

describe('agenda accessibility', () => {
  it('003-AS1: the list of the day’s events is clean', async () => {
    await renderRoute({ initialEntries: ['/agenda?date=2026-11-08'] });
    await screen.findByRole('list', { name: 'Animations de la journée' });
    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('003-AS3: the empty day is clean', async () => {
    await renderRoute({ initialEntries: ['/agenda?date=2026-11-10'] });
    await screen.findByText('Aucune animation n’est prévue ce jour-là.');
    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('003-AS7: the error message is clean', async () => {
    mockControl.failPersistently('GET /api/agenda', 503, 'INTERNAL_ERROR');
    await renderRoute({ initialEntries: ['/agenda?date=2026-11-08'] });
    await screen.findByRole('alert');
    expect(axeFindings(await runAxe())).toEqual([]);
  });
});
