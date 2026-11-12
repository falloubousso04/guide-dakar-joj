// Prouve que AnswerChatMessage relie l'IA et les lieux : ce qui manque, l'heure de départ, l'épreuve passée.
import type { ChatMessage, PlaceSuggestion } from '@joj/shared';
import { describe, expect, it } from 'vitest';
import type { Clock } from './clock';
import { FakeReachablePlaces } from './testing/fake-reachable-places';
import { FakeTouristAssistant } from './testing/fake-tourist-assistant';
import { AnswerChatMessage } from './use-cases/answer-chat-message';

const SENT_AT = new Date('2026-11-07T09:00:00Z');
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

function setup() {
  const assistant = new FakeTouristAssistant();
  const reachablePlaces = new FakeReachablePlaces();
  const clock: Clock = { now: () => SENT_AT };
  return {
    assistant,
    reachablePlaces,
    answerChatMessage: new AnswerChatMessage(assistant, reachablePlaces, clock),
  };
}

const say = (content: string): ChatMessage => ({ role: 'user', content });

describe('chat (application layer)', () => {
  it('001-AS1: answers with a text and the reachable places', async () => {
    const { assistant, reachablePlaces, answerChatMessage } = setup();
    assistant.request = { site: 'diamniadio', eventTime: EVENT_TIME, now: NOW };
    assistant.replyText = 'Tu as le temps de visiter Gorée.';
    reachablePlaces.places = [goree];

    const answer = await answerChatMessage.execute([
      say('je suis à Diamniadio, il est 11 h 30, mon match est à 17 h'),
    ]);

    expect(answer).toEqual({
      reply: 'Tu as le temps de visiter Gorée.',
      places: [goree],
      missing: [],
    });
    expect(reachablePlaces.queries).toEqual([
      { site: 'diamniadio', now: NOW, eventTime: EVENT_TIME },
    ]);
    // La réponse présente la liste de la règle de temps, elle ne la choisit pas.
    expect(assistant.replies[0]).toMatchObject({ places: [goree], missing: [] });
  });

  it('001-AS4: asks for the missing site or event time and proposes no place', async () => {
    const { assistant, reachablePlaces, answerChatMessage } = setup();
    reachablePlaces.places = [goree];

    assistant.request = { site: null, eventTime: EVENT_TIME, now: null };
    const withoutSite = await answerChatMessage.execute([say('mon match est à 17 h')]);
    expect(withoutSite).toMatchObject({ places: [], missing: ['site'] });

    assistant.request = { site: 'dakar', eventTime: null, now: null };
    const withoutTime = await answerChatMessage.execute([say('je suis à Dakar')]);
    expect(withoutTime).toMatchObject({ places: [], missing: ['eventTime'] });

    assistant.request = { site: null, eventTime: null, now: null };
    const withNothing = await answerChatMessage.execute([say('bonjour')]);
    expect(withNothing).toMatchObject({ places: [], missing: ['site', 'eventTime'] });

    expect(reachablePlaces.queries).toEqual([]);
    expect(assistant.replies.map((input) => input.missing)).toEqual([
      ['site'],
      ['eventTime'],
      ['site', 'eventTime'],
    ]);
  });

  it('001-AS5: gives the whole conversation to the assistant', async () => {
    const { assistant, reachablePlaces, answerChatMessage } = setup();
    // Claude retrouve le site dans le premier message et l'heure dans la réponse « 17 h ».
    assistant.request = { site: 'diamniadio', eventTime: EVENT_TIME, now: NOW };
    reachablePlaces.places = [goree];
    const conversation: ChatMessage[] = [
      say('je suis à Diamniadio'),
      { role: 'assistant', content: 'À quelle heure est ton épreuve ?' },
      say('17 h'),
    ];

    const answer = await answerChatMessage.execute(conversation);

    expect(assistant.understood).toEqual([conversation]);
    expect(reachablePlaces.queries).toEqual([
      { site: 'diamniadio', now: NOW, eventTime: EVENT_TIME },
    ]);
    expect(answer.places).toEqual([goree]);
  });

  it('001-AS6: starts the free time when the message is sent', async () => {
    const { assistant, reachablePlaces, answerChatMessage } = setup();
    assistant.request = { site: 'saly', eventTime: EVENT_TIME, now: null };

    await answerChatMessage.execute([say('je suis à Saly, mon épreuve est à 17 h')]);

    expect(reachablePlaces.queries).toEqual([
      { site: 'saly', now: SENT_AT, eventTime: EVENT_TIME },
    ]);
  });

  it('001-AS8: rejects an event time already passed', async () => {
    const { assistant, reachablePlaces, answerChatMessage } = setup();
    assistant.request = {
      site: 'diamniadio',
      eventTime: new Date('2026-11-07T10:00:00Z'),
      now: NOW,
    };

    await expect(
      answerChatMessage.execute([say('il est 11 h 30, mon épreuve était à 10 h')]),
    ).rejects.toMatchObject({ code: 'EVENT_TIME_PASSED', kind: 'BUSINESS_RULE' });
    expect(reachablePlaces.queries).toEqual([]);
    expect(assistant.replies).toEqual([]);
  });
});
