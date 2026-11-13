import type { ChatResponse, DisciplineResponse, PlaceSuggestion } from '@joj/shared';

/**
 * Les données de la fausse API, en mémoire. Les handlers les lisent et les modifient comme la
 * vraie base ; `resetFixture()` (appelé après chaque test par `mockControl.reset()`) les remet
 * dans cet état, pour qu'un test ne dépende jamais de ce qu'un autre a créé ou supprimé.
 */
export const lutte: DisciplineResponse = {
  id: '0199f5c2-0000-7000-8000-000000000003',
  name: 'Lutte',
  category: 'sports-de-combat',
  createdAt: '2026-10-01T08:00:00.000Z',
};

export const natation: DisciplineResponse = {
  id: '0199f5c2-0000-7000-8000-000000000004',
  name: 'Natation',
  category: 'sports-nautiques',
  createdAt: '2026-10-01T08:00:00.000Z',
};

/** Un identifiant au bon format qu'aucune discipline ne porte. */
export const UNKNOWN_ID = '0199f5c2-0000-7000-8000-00000000ffff';

/**
 * Lieux faisables depuis Diamniadio pour un supporter libre de 11 h 30 à 17 h (heure de Dakar,
 * UTC), triés par heure de retour comme le fait l'API.
 */
const soumbedioune: PlaceSuggestion = {
  id: '0199f5c2-0000-7000-8000-000000000101',
  name: 'Village artisanal de Soumbédioune',
  district: 'Médina',
  visitMinutes: 60,
  travelMinutes: 50,
  backAt: '2026-11-07T14:10:00.000Z',
  location: { latitude: 14.6786, longitude: -17.4637 },
};

const lacRose: PlaceSuggestion = {
  id: '0199f5c2-0000-7000-8000-000000000102',
  name: 'Lac Rose',
  district: 'Niaga',
  visitMinutes: 90,
  travelMinutes: 40,
  backAt: '2026-11-07T14:20:00.000Z',
  location: { latitude: 14.8386, longitude: -17.2314 },
};

const museeCivilisations: PlaceSuggestion = {
  id: '0199f5c2-0000-7000-8000-000000000103',
  name: 'Musée des Civilisations noires',
  district: 'Plateau',
  visitMinutes: 90,
  travelMinutes: 45,
  backAt: '2026-11-07T14:30:00.000Z',
  location: null,
};

/** La réponse par défaut de `POST /api/chat` : trois lieux proposés. */
export const placesReply: ChatResponse = {
  reply:
    'Vous avez le temps avant votre match de 17 h : voici trois lieux où aller, visiter et revenir à temps.',
  places: [soumbedioune, lacRose, museeCivilisations],
  missing: [],
};

/** Le chatbot demande l'heure de l'épreuve, et ne propose aucun lieu. */
export const askEventTimeReply: ChatResponse = {
  reply: 'À quelle heure est votre prochaine épreuve ?',
  places: [],
  missing: ['eventTime'],
};

const initial = (): { disciplines: DisciplineResponse[]; chatReply: ChatResponse } => ({
  disciplines: [{ ...lutte }, { ...natation }],
  // Ce que répond `POST /api/chat`, quel que soit le message : un test le remplace.
  chatReply: placesReply,
});

export const fixture = initial();

export function resetFixture(): void {
  Object.assign(fixture, initial());
}
