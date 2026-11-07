/**
 * Un audit axe-core de chaque état de l'écran du chatbot : accueil avec ses exemples,
 * indicateur d'attente, réponse avec ses cartes de lieux, et refus de l'API. Un état qui n'est
 * jamais audité peut régresser sans bruit.
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockControl } from '@/mocks/control';
import { placesReply } from '@/mocks/fixture';
import { axeFindings, runAxe } from '@/test/axe';
import { renderRoute } from '@/test/utils';

async function open() {
  await renderRoute({ initialEntries: ['/chat'] });
  await screen.findByLabelText('Votre message');
  return userEvent.setup();
}

async function send(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Votre message'), 'Je suis à Diamniadio, match à 17 h');
  await user.click(screen.getByRole('button', { name: 'Envoyer' }));
}

describe('chat accessibility', () => {
  it('001-AS10: the welcome screen with its examples is clean', async () => {
    await open();
    expect(
      screen.getByRole('button', { name: 'Je suis à Diamniadio, mon match est à 17 h' }),
    ).toBeInTheDocument();
    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('001-AS10: the typing indicator is clean', async () => {
    // Assez long pour que la réponse n'arrive pas pendant l'audit.
    mockControl.setLatency(1000);
    const user = await open();
    await send(user);
    await screen.findByRole('status');
    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('001-AS10: the reply with its place cards is clean', async () => {
    const user = await open();
    await send(user);
    await screen.findByText(placesReply.reply);
    expect(screen.getByRole('list', { name: 'Lieux proposés' })).toBeInTheDocument();
    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('001-AS9: the error message is clean', async () => {
    mockControl.failNext('POST /api/chat', 503, 'ASSISTANT_UNAVAILABLE');
    const user = await open();
    await send(user);
    await screen.findByRole('alert');
    expect(axeFindings(await runAxe())).toEqual([]);
  });
});
