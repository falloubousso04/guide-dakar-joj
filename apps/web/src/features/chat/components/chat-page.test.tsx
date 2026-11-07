/**
 * La page /chat, montée par sa vraie route sur la fausse API (`mocks/handlers.ts`) : message du
 * supporter, indicateur d'attente, réponse du chatbot avec une carte par lieu, refus de l'API et
 * message vide. Chaque test vérifie ce que l'écran affiche et ce qui est parti sur le réseau.
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockControl } from '@/mocks/control';
import { askEventTimeReply, fixture, placesReply } from '@/mocks/fixture';
import { renderRoute, trackRequests, writes } from '@/test/utils';

type User = ReturnType<typeof userEvent.setup>;

const FIRST_MESSAGE = 'Je suis à Diamniadio, il est 11 h 30, mon match est à 17 h';

async function open() {
  const user = userEvent.setup();
  const seen = trackRequests();
  await renderRoute({ initialEntries: ['/chat'] });
  await screen.findByLabelText('Votre message');
  return { user, seen };
}

async function send(user: User, text: string) {
  await user.type(screen.getByLabelText('Votre message'), text);
  await user.click(screen.getByRole('button', { name: 'Envoyer' }));
}

const conversation = () => screen.getByRole('log', { name: 'Conversation' });

describe('ChatPage', () => {
  it('001-AS10: shows the message, a typing indicator, then the reply with one card per place', async () => {
    mockControl.setLatency(50);
    const { user, seen } = await open();

    await send(user, FIRST_MESSAGE);

    expect(within(conversation()).getByText(FIRST_MESSAGE)).toBeInTheDocument();
    expect(screen.getByLabelText('Votre message')).toHaveValue('');
    expect(await screen.findByRole('status')).toHaveTextContent('Le chatbot écrit…');

    expect(await within(conversation()).findByText(placesReply.reply)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    const places = within(conversation()).getByRole('list', { name: 'Lieux proposés' });
    const cards = within(places).getAllByRole('listitem');
    expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      'Village artisanal de Soumbédioune',
      'Lac Rose',
      'Musée des Civilisations noires',
    ]);
    expect(cards[0]).toHaveTextContent(
      /Médina.*Visite\s*1 h.*Trajet\s*50 min.*Retour au site à 14 h 10/,
    );
    expect(cards[1]).toHaveTextContent(/Visite\s*1 h 30.*Retour au site à 14 h 20/);
    expect(writes(seen)).toEqual([
      {
        method: 'POST',
        path: '/api/chat',
        body: { messages: [{ role: 'user', content: FIRST_MESSAGE }] },
      },
    ]);
  });

  it('001-AS10: sends an example question when the supporter clicks it', async () => {
    const { user, seen } = await open();

    await user.click(
      screen.getByRole('button', { name: 'Je suis à Diamniadio, mon match est à 17 h' }),
    );

    expect(await within(conversation()).findByText(placesReply.reply)).toBeInTheDocument();
    expect(writes(seen).map((request) => request.body)).toEqual([
      { messages: [{ role: 'user', content: 'Je suis à Diamniadio, mon match est à 17 h' }] },
    ]);
  });

  it('001-AS5: sends the whole conversation with the next message', async () => {
    fixture.chatReply = askEventTimeReply;
    const { user, seen } = await open();
    await send(user, 'Je suis à Diamniadio');
    await within(conversation()).findByText(askEventTimeReply.reply);
    expect(within(conversation()).queryByRole('list', { name: 'Lieux proposés' })).toBeNull();

    fixture.chatReply = placesReply;
    await send(user, '17 h');

    expect(await within(conversation()).findByText(placesReply.reply)).toBeInTheDocument();
    expect(writes(seen).map((request) => request.body)).toEqual([
      { messages: [{ role: 'user', content: 'Je suis à Diamniadio' }] },
      {
        messages: [
          { role: 'user', content: 'Je suis à Diamniadio' },
          { role: 'assistant', content: askEventTimeReply.reply },
          { role: 'user', content: '17 h' },
        ],
      },
    ]);
  });

  it('001-AS8: says the event time has already passed, without proposing places', async () => {
    mockControl.failNext('POST /api/chat', 422, 'EVENT_TIME_PASSED');
    const { user } = await open();

    await send(user, 'Il est 11 h 30, mon épreuve était à 10 h, je suis à Dakar');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'L’heure de votre épreuve est déjà passée.',
    );
    expect(screen.queryByRole('list', { name: 'Lieux proposés' })).not.toBeInTheDocument();
  });

  it('001-AS9: says the chatbot could not answer, without proposing places', async () => {
    mockControl.failNext('POST /api/chat', 503, 'ASSISTANT_UNAVAILABLE');
    const { user } = await open();

    await send(user, FIRST_MESSAGE);

    expect(await screen.findByRole('alert')).toHaveTextContent('Le chatbot n’a pas pu répondre.');
    expect(screen.queryByRole('list', { name: 'Lieux proposés' })).not.toBeInTheDocument();
    expect(within(conversation()).getByText(FIRST_MESSAGE)).toBeInTheDocument();
  });

  it('001-AS11: sends nothing and adds no message when the input is empty or blank', async () => {
    const { user, seen } = await open();

    await user.click(screen.getByRole('button', { name: 'Envoyer' }));
    await user.type(screen.getByLabelText('Votre message'), '   {Enter}');

    expect(within(conversation()).queryAllByRole('listitem')).toEqual([]);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(writes(seen)).toEqual([]);
  });
});
