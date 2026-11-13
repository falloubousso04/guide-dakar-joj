import { describe, expect, it } from 'vitest';
import { Place } from '../domain/place';
import { InMemoryPlaceRepository } from './testing/in-memory-place.repository';
import { FindReachablePlaces } from './use-cases/find-reachable-places';

function makePlace(
  id: string,
  name: string,
  visitMinutes: number,
  travel: number,
  location: { latitude: number; longitude: number } | null = null,
) {
  return Place.create({
    id,
    name,
    district: 'Dakar',
    visitMinutes,
    travelMinutes: { dakar: travel, diamniadio: travel, saly: travel },
    location,
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

  it('001-AS1: sorts the reachable places by return time, whatever their stored order', async () => {
    const repo = new InMemoryPlaceRepository([
      makePlace('0199f5c2-0000-7000-8000-000000000012', 'Back at 15:30', 120, 60), // 240 min
      makePlace('0199f5c2-0000-7000-8000-000000000013', 'Back at 13:30', 60, 30), // 120 min
      makePlace('0199f5c2-0000-7000-8000-000000000014', 'Back at 14:30', 90, 45), // 180 min
    ]);

    const results = await new FindReachablePlaces(repo).find({
      site: 'diamniadio',
      now: NOW,
      eventTime: EVENT_TIME,
    });

    expect(results.map((place) => place.name)).toEqual([
      'Back at 13:30',
      'Back at 14:30',
      'Back at 15:30',
    ]);
  });

  it('001-AS3: proposes a place that brings the supporter back exactly at the event time', async () => {
    const repo = new InMemoryPlaceRepository([
      makePlace('0199f5c2-0000-7000-8000-000000000015', 'Exactly 5 h 30', 150, 90), // 330 min
    ]);

    const results = await new FindReachablePlaces(repo).find({
      site: 'diamniadio',
      now: NOW,
      eventTime: EVENT_TIME,
    });

    expect(results).toEqual([
      expect.objectContaining({ name: 'Exactly 5 h 30', backAt: EVENT_TIME.toISOString() }),
    ]);
  });

  it('001-AS2: leaves out a place that takes 6 h between 11:30 and 17:00', async () => {
    const repo = new InMemoryPlaceRepository([
      makePlace('0199f5c2-0000-7000-8000-000000000016', 'Six hours', 180, 90), // 360 min
      makePlace('0199f5c2-0000-7000-8000-000000000017', 'Two hours', 60, 30), // 120 min
    ]);

    const results = await new FindReachablePlaces(repo).find({
      site: 'diamniadio',
      now: NOW,
      eventTime: EVENT_TIME,
    });

    expect(results.map((place) => place.name)).toEqual(['Two hours']);
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

  it('002-AS1: returns the location of each suggested place', async () => {
    const location = { latitude: 14.6937, longitude: -17.4441 };
    const repo = new InMemoryPlaceRepository([
      makePlace('0199f5c2-0000-7000-8000-000000000001', 'Village des Arts', 60, 30, location),
    ]);
    const useCase = new FindReachablePlaces(repo);

    const results = await useCase.find({ site: 'diamniadio', now: NOW, eventTime: EVENT_TIME });

    expect(results[0]?.location).toEqual(location);
  });

  it('002-AS4: proposes a place without location in the same order as the others', async () => {
    const repo = new InMemoryPlaceRepository([
      makePlace('0199f5c2-0000-7000-8000-000000000002', 'Sans emplacement', 30, 30), // 90 min
      makePlace('0199f5c2-0000-7000-8000-000000000001', 'Avec emplacement', 60, 30, {
        latitude: 14.7,
        longitude: -17.4,
      }), // 120 min
    ]);
    const useCase = new FindReachablePlaces(repo);

    const results = await useCase.find({ site: 'diamniadio', now: NOW, eventTime: EVENT_TIME });

    expect(results.map((place) => place.name)).toEqual(['Sans emplacement', 'Avec emplacement']);
    expect(results[0]?.location).toBeNull();
  });
});
