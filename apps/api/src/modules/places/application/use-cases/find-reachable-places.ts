import { Injectable } from '@nestjs/common';
import type { PlaceSuggestion } from '@joj/shared';
import {
  ReachablePlaces,
  type ReachablePlacesQuery,
} from '../../../chat/application/reachable-places';
import { PlaceRepository } from '../place.repository';

@Injectable()
export class FindReachablePlaces extends ReachablePlaces {
  constructor(private readonly repo: PlaceRepository) {
    super();
  }

  async find({ site, now, eventTime }: ReachablePlacesQuery): Promise<PlaceSuggestion[]> {
    const all = await this.repo.findAll();
    return all
      .filter((place) => place.returnTime(site, now) <= eventTime)
      .sort((a, b) => a.returnTime(site, now).getTime() - b.returnTime(site, now).getTime())
      .map((place) => ({
        id: place.id,
        name: place.name,
        district: place.district,
        visitMinutes: place.visitMinutes,
        travelMinutes: place.travelMinutes[site],
        backAt: place.returnTime(site, now).toISOString(),
      }));
  }
}
