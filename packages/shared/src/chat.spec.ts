import { describe, expect, it } from 'vitest';
import { chatRequestSchema } from './chat.ts';

describe('chatRequestSchema', () => {
  it('001-AS11: accepts a conversation and trims each message', () => {
    expect(
      chatRequestSchema.parse({ messages: [{ role: 'user', content: '  je suis à Saly ' }] }),
    ).toEqual({ messages: [{ role: 'user', content: 'je suis à Saly' }] });
  });

  it.each(['', '   '])('001-AS11: rejects a blank message (%j)', (content) => {
    expect(chatRequestSchema.safeParse({ messages: [{ role: 'user', content }] }).success).toBe(
      false,
    );
  });

  it('001-AS11: rejects an empty conversation', () => {
    expect(chatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
  });
});
