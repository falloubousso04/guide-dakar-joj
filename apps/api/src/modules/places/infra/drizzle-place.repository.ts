import { Inject, Injectable } from '@nestjs/common';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { PlaceRepository } from '../application/place.repository';
import type { Place } from '../domain/place';
import { toDomain } from './place.mapper';
import { places } from './places.schema';

@Injectable()
export class DrizzlePlaceRepository extends PlaceRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async findAll(): Promise<Place[]> {
    const rows = await this.db.select().from(places);
    return rows.map(toDomain);
  }
}
