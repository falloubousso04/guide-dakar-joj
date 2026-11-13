import { describe, expect, it } from 'vitest';
import { dayAgendaQuerySchema } from './agenda.ts';

describe('dayAgendaQuerySchema', () => {
  it('003-AS6: accepts a real calendar date', () => {
    expect(dayAgendaQuerySchema.parse({ date: '2026-11-08' })).toEqual({ date: '2026-11-08' });
  });

  it.each(['2026-13-45', 'demain', '2026-02-30', ''])(
    '003-AS6: rejects an unreadable date (%j) with a message on the date',
    (date) => {
      const result = dayAgendaQuerySchema.safeParse({ date });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['date']);
    },
  );

  it('003-AS6: rejects a missing date', () => {
    const result = dayAgendaQuerySchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['date']);
  });
});
