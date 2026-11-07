import type { OlympicSite, PlaceSuggestion } from '@joj/shared';

export interface ReachablePlacesQuery {
  site: OlympicSite;
  now: Date;
  eventTime: Date;
}

/**
 * Port des lieux faisables, implémenté par FindReachablePlaces (module places).
 * Un lieu est retenu si now + trajet aller + visite + trajet retour <= eventTime ;
 * tri : retour le plus tôt d'abord.
 */
export abstract class ReachablePlaces {
  abstract find(query: ReachablePlacesQuery): Promise<PlaceSuggestion[]>;
}
