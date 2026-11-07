import type { ChatMessage, MissingInfo, OlympicSite, PlaceSuggestion } from '@joj/shared';

/** Ce que Claude a compris de la conversation. Un champ vaut null quand le supporter ne l'a pas dit. */
export interface VisitorRequest {
  site: OlympicSite | null;
  /** L'heure de la prochaine épreuve du supporter. */
  eventTime: Date | null;
  /** L'heure que le supporter a donnée ; null : le cas d'usage prend l'heure du serveur. */
  now: Date | null;
}

export interface ReplyInput {
  request: VisitorRequest;
  /** Les lieux choisis par la règle de temps : la réponse les présente, elle n'en ajoute aucun. */
  places: PlaceSuggestion[];
  missing: MissingInfo[];
}

/**
 * Port de l'IA : comprendre la conversation, puis rédiger la réponse.
 * Implémenté par ClaudeTouristAssistant (infra) et FakeTouristAssistant (tests).
 * Les deux méthodes lèvent ASSISTANT_UNAVAILABLE si l'IA ne répond pas.
 */
export abstract class TouristAssistant {
  abstract understand(messages: ChatMessage[]): Promise<VisitorRequest>;
  abstract reply(input: ReplyInput): Promise<string>;
}
