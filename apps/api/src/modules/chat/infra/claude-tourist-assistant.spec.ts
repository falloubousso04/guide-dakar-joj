import Anthropic from '@anthropic-ai/sdk';
import type { PlaceSuggestion } from '@joj/shared';
import { describe, expect, it, vi } from 'vitest';
import { ClaudeTouristAssistant } from './claude-tourist-assistant';

const TODAY = new Date('2026-11-07T09:00:00.000Z');
const today = () => TODAY;
const conversation = [
  { role: 'user' as const, content: 'je suis à Diamniadio, il est 11 h 30, mon match est à 17 h' },
];

/** Faux client SDK : seules les deux méthodes appelées par l'assistant existent. */
function fakeClient(messages: { parse?: unknown; create?: unknown }): Anthropic {
  return { beta: { messages } } as unknown as Anthropic;
}

const goree: PlaceSuggestion = {
  id: '0199f5c2-0000-7000-8000-000000000101',
  name: 'Île de Gorée',
  district: 'Gorée',
  visitMinutes: 120,
  travelMinutes: 60,
  backAt: '2026-11-07T15:30:00.000Z',
};

describe('ClaudeTouristAssistant', () => {
  it('001-AS9: turns an SDK failure into ASSISTANT_UNAVAILABLE', async () => {
    const parse = vi
      .fn<(params: unknown) => Promise<unknown>>()
      .mockRejectedValue(new Anthropic.APIConnectionError({ message: 'down' }));
    const assistant = new ClaudeTouristAssistant(fakeClient({ parse }), today);

    await expect(assistant.understand(conversation)).rejects.toMatchObject({
      code: 'ASSISTANT_UNAVAILABLE',
      kind: 'UNAVAILABLE',
    });
  });

  it('001-AS9: answers ASSISTANT_UNAVAILABLE when no API key is configured', async () => {
    const assistant = new ClaudeTouristAssistant(null, today);

    await expect(assistant.understand(conversation)).rejects.toMatchObject({
      code: 'ASSISTANT_UNAVAILABLE',
    });
    await expect(
      assistant.reply({
        request: { site: null, eventTime: null, now: null },
        places: [],
        missing: ['site'],
      }),
    ).rejects.toMatchObject({ code: 'ASSISTANT_UNAVAILABLE' });
  });

  it('001-AS9: answers ASSISTANT_UNAVAILABLE when Claude declines', async () => {
    const parse = vi
      .fn<(params: unknown) => Promise<unknown>>()
      .mockResolvedValue({ stop_reason: 'refusal', parsed_output: null, content: [] });
    const assistant = new ClaudeTouristAssistant(fakeClient({ parse }), today);

    await expect(assistant.understand(conversation)).rejects.toMatchObject({
      code: 'ASSISTANT_UNAVAILABLE',
    });
  });

  it('001-AS1: turns the times Claude read into dates of the day, at Dakar time', async () => {
    const parse = vi.fn<(params: unknown) => Promise<unknown>>().mockResolvedValue({
      stop_reason: 'end_turn',
      parsed_output: { site: 'diamniadio', eventTime: '17:00', now: '11:30' },
      content: [],
    });
    const assistant = new ClaudeTouristAssistant(fakeClient({ parse }), today);

    await expect(assistant.understand(conversation)).resolves.toEqual({
      site: 'diamniadio',
      eventTime: new Date('2026-11-07T17:00:00.000Z'),
      now: new Date('2026-11-07T11:30:00.000Z'),
    });
    expect(parse.mock.calls[0]?.[0]).toMatchObject({
      model: 'claude-opus-5-5',
      messages: [{ role: 'user', content: conversation[0]?.content }],
    });
  });

  it('001-AS4: keeps null for what the supporter did not say', async () => {
    const parse = vi.fn<(params: unknown) => Promise<unknown>>().mockResolvedValue({
      stop_reason: 'end_turn',
      parsed_output: { site: null, eventTime: 'vers 17h', now: null },
      content: [],
    });
    const assistant = new ClaudeTouristAssistant(fakeClient({ parse }), today);

    await expect(assistant.understand(conversation)).resolves.toEqual({
      site: null,
      eventTime: null,
      now: null,
    });
  });

  it('001-AS1: writes the reply from the places it is given', async () => {
    const create = vi.fn<(params: unknown) => Promise<unknown>>().mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Tu as le temps de visiter Gorée.' }],
    });
    const assistant = new ClaudeTouristAssistant(fakeClient({ create }), today);

    await expect(
      assistant.reply({
        request: { site: 'diamniadio', eventTime: new Date('2026-11-07T17:00:00.000Z'), now: null },
        places: [goree],
        missing: [],
      }),
    ).resolves.toBe('Tu as le temps de visiter Gorée.');
    expect(JSON.stringify(create.mock.calls[0]?.[0])).toContain('Île de Gorée');
  });
});
