import { describe, expect, it } from 'vitest';
import { AgendaDay } from './agenda-day';

describe('AgendaDay', () => {
  it.each(['2026-10-31', '2026-11-13'])(
    '003-AS4: accepts the first and the last day of the Games (%s)',
    (date) => {
      const day = AgendaDay.of(date);
      expect(day.date).toBe(date);
      expect(day.start).toEqual(new Date(`${date}T00:00:00.000Z`));
    },
  );

  it('003-AS4: a day ends where the next one starts, in Dakar time (UTC)', () => {
    const day = AgendaDay.of('2026-11-13');
    expect(day.end).toEqual(new Date('2026-11-14T00:00:00.000Z'));
  });

  it.each(['2026-10-30', '2026-11-14'])('003-AS5: rejects a day outside the Games (%s)', (date) => {
    expect(() => AgendaDay.of(date)).toThrow(
      expect.objectContaining({
        code: 'AGENDA_DATE_OUTSIDE_GAMES',
        kind: 'BUSINESS_RULE',
        details: { date },
      }),
    );
  });
});
