import type { PlaceSuggestion } from '@joj/shared';
import { ReachablePlaces, type ReachablePlacesQuery } from '../reachable-places';

/** Faux des lieux faisables, en attendant FindReachablePlaces (module places) : le test règle la liste. */
export class FakeReachablePlaces extends ReachablePlaces {
  /** Ce que `find` renvoie. */
  places: PlaceSuggestion[] = [];
  /** Les recherches reçues, dans l'ordre. */
  readonly queries: ReachablePlacesQuery[] = [];

  find(query: ReachablePlacesQuery): Promise<PlaceSuggestion[]> {
    this.queries.push(query);
    return Promise.resolve(this.places);
  }
}
