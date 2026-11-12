import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface PlaceRow {
  name: string;
  latitude?: number;
  longitude?: number;
}

const places = JSON.parse(
  readFileSync(new URL('../data/places.json', import.meta.url), 'utf8'),
) as PlaceRow[];

// Un garde-fou grossier : un cadre autour de Dakar, Diamniadio et du Lac Rose, pas une preuve d'exactitude.
const AROUND_DAKAR = { south: 14.5, north: 15.0, west: -17.6, east: -17.0 };

describe('demo places location', () => {
  it('002-AS1: every demo place has a location around Dakar', () => {
    for (const place of places) {
      expect(place.latitude, `${place.name} latitude`).toBeGreaterThan(AROUND_DAKAR.south);
      expect(place.latitude, `${place.name} latitude`).toBeLessThan(AROUND_DAKAR.north);
      expect(place.longitude, `${place.name} longitude`).toBeGreaterThan(AROUND_DAKAR.west);
      expect(place.longitude, `${place.name} longitude`).toBeLessThan(AROUND_DAKAR.east);
    }
  });
});
