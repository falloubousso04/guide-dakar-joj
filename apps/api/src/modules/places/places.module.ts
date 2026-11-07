import { Module } from '@nestjs/common';
import { ReachablePlaces } from '../chat/application/reachable-places';
import { PlaceRepository } from './application/place.repository';
import { FindReachablePlaces } from './application/use-cases/find-reachable-places';
import { DrizzlePlaceRepository } from './infra/drizzle-place.repository';

@Module({
  providers: [
    { provide: PlaceRepository, useClass: DrizzlePlaceRepository },
    { provide: ReachablePlaces, useClass: FindReachablePlaces },
    FindReachablePlaces,
  ],
  exports: [ReachablePlaces, FindReachablePlaces],
})
export class PlacesModule {}
