import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface PlaceRow {
  name: string;
  visit_minutes: number;
  travel_minutes: Record<string, number>;
}

const places = JSON.parse(
  readFileSync(new URL('../data/places.json', import.meta.url), 'utf8'),
) as PlaceRow[];

/** Aller, visite et retour depuis Diamniadio, en minutes. */
const fromDiamniadio = (place: PlaceRow) =>
  place.travel_minutes['diamniadio']! * 2 + place.visit_minutes;

describe('demo places data', () => {
  it('001-AS3: has a place that takes exactly 5 h 30 from Diamniadio, for the 11:30 to 17:00 demo', () => {
    expect(places.filter((place) => fromDiamniadio(place) === 330).length).toBeGreaterThan(0);
  });

  it('001-AS2: has a place that takes more than 6 h from Diamniadio', () => {
    expect(places.filter((place) => fromDiamniadio(place) > 360).length).toBeGreaterThan(0);
  });
});
