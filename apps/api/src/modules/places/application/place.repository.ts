import type { Place } from '../domain/place';

export abstract class PlaceRepository {
  abstract findAll(): Promise<Place[]>;
}
