import { describe, expect, it } from 'vitest';
import { Place } from '../domain/place';
import { InMemoryPlaceRepository } from './testing/in-memory-place.repository';
import { FindReachablePlaces } from './use-cases/find-reachable-places';

function makePlace(id: string, name: string, visitMinutes: number, travel: number) {
  return Place.create({
    id,
    name,
    district: 'Dakar',
    visitMinutes,
    travelMinutes: { dakar: travel, diamniadio: travel, saly: travel },
  });
}

const NOW = new Date('2026-07-15T11:30:00.000Z');
const EVENT_TIME = new Date('2026-07-15T17:00:00.000Z');

describe('FindReachablePlaces', () => {
  it('001-AS1: returns reachable places sorted by earliest return time', async () => {
    const repo = new InMemoryPlaceRepository([
      makePlace('0199f5c2-0000-7000-8000-000000000003', 'Trop loin', 180, 90), // 360 min > 330
      makePlace('0199f5c2-0000-7000-8000-000000000001', 'Place A', 60, 30), // 120 min
      makePlace('0199f5c2-0000-7000-8000-000000000002', 'Place B', 120, 60), // 240 min
    ]);
    const useCase = new FindReachablePlaces(repo);

    const results = await useCase.find({ site: 'diamniadio', now: NOW, eventTime: EVENT_TIME });

    expect(results).toHaveLength(2);
    const [first, second] = results;
    expect(first?.name).toBe('Place A');
    expect(second?.name).toBe('Place B');
    expect(first?.backAt).toBe(new Date('2026-07-15T13:30:00.000Z').toISOString());
    expect(first?.travelMinutes).toBe(30);
    expect(first?.visitMinutes).toBe(60);
  });

  it('001-AS7: returns empty list when no place fits in 20 minutes', async () => {
    const repo = new InMemoryPlaceRepository([
      makePlace('0199f5c2-0000-7000-8000-000000000001', 'Marché Kermel', 20, 5), // 30 min
    ]);
    const useCase = new FindReachablePlaces(repo);
    const eventTime = new Date('2026-07-15T11:50:00.000Z');

    const results = await useCase.find({ site: 'diamniadio', now: NOW, eventTime });

    expect(results).toHaveLength(0);
  });
});
