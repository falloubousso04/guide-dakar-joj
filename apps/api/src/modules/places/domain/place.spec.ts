import { describe, expect, it } from 'vitest';
import { Place } from './place';

const ID = '0199f5c2-0000-7000-8000-000000000001';
const NOW = new Date('2026-07-15T11:30:00.000Z');

const validProps = {
  id: ID,
  name: 'Marché Kermel',
  district: 'Plateau',
  visitMinutes: 60,
  travelMinutes: { dakar: 15, diamniadio: 60, saly: 90 } as const,
  location: null,
};

describe('Place', () => {
  it('creates a place with valid props', () => {
    const place = Place.create(validProps);
    expect(place.name).toBe('Marché Kermel');
    expect(place.visitMinutes).toBe(60);
  });

  it('001-AS2: a 6h place (90+180+90) has returnTime after 17h00', () => {
    const place = Place.create({
      id: ID,
      name: 'Lieu lointain',
      district: 'Loin',
      visitMinutes: 180,
      travelMinutes: { dakar: 90, diamniadio: 90, saly: 90 },
      location: null,
    });
    const backAt = place.returnTime('diamniadio', NOW);
    expect(backAt).toEqual(new Date('2026-07-15T17:30:00.000Z'));
  });

  it('001-AS3: a 5h30 place (60+210+60) returns exactly at 17h00', () => {
    const place = Place.create({
      id: ID,
      name: 'Lieu juste',
      district: 'Centre',
      visitMinutes: 210,
      travelMinutes: { dakar: 60, diamniadio: 60, saly: 60 },
      location: null,
    });
    const backAt = place.returnTime('diamniadio', NOW);
    expect(backAt).toEqual(new Date('2026-07-15T17:00:00.000Z'));
  });

  it('rejects a place without a name', () => {
    expect(() => Place.create({ ...validProps, name: '   ' })).toThrow(
      expect.objectContaining({ code: 'PLACE_NAME_REQUIRED', kind: 'VALIDATION' }),
    );
  });

  it('rejects a visit duration below 1 minute', () => {
    expect(() => Place.create({ ...validProps, visitMinutes: 0 })).toThrow(
      expect.objectContaining({ code: 'PLACE_VISIT_MINUTES_INVALID', kind: 'VALIDATION' }),
    );
  });
});
