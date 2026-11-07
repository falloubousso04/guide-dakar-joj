import { Place } from '../../domain/place';
import { PlaceRepository } from '../place.repository';

export class InMemoryPlaceRepository extends PlaceRepository {
  constructor(private readonly places: Place[] = []) {
    super();
  }

  async findAll(): Promise<Place[]> {
    return [...this.places];
  }
}
