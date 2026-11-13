import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { Place } from '../domain/place';
import { DrizzlePlaceRepository } from './drizzle-place.repository';
import { toRow } from './place.mapper';
import { places } from './places.schema';

const newPlace = (id: string, name: string, location: Place['location']) =>
  Place.create({
    id,
    name,
    district: 'Plateau',
    visitMinutes: 60,
    travelMinutes: { dakar: 15, diamniadio: 60, saly: 90 },
    location,
  });

describe('DrizzlePlaceRepository (in-memory PGlite, migrations applied)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzlePlaceRepository;

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    repository = new DrizzlePlaceRepository(connection.db);
  });

  afterAll(() => connection?.close());

  it('002-AS1: stores and restores the location of a place, null included', async () => {
    const located = newPlace('0199f5c2-0000-7000-8000-0000000000a1', 'Village des Arts', {
      latitude: 14.6937,
      longitude: -17.4441,
    });
    const unlocated = newPlace('0199f5c2-0000-7000-8000-0000000000a2', 'Sans emplacement', null);
    await connection.db.insert(places).values([toRow(located), toRow(unlocated)]);

    const all = await repository.findAll();

    expect(all.find((place) => place.id === located.id)?.location).toEqual({
      latitude: 14.6937,
      longitude: -17.4441,
    });
    expect(all.find((place) => place.id === unlocated.id)?.location).toBeNull();
  });
});
