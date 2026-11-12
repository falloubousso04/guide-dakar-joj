# 002 — Voir le lieu sur la carte : plan

**Statut** : Validé

## 1. Résumé

On ajoute un emplacement (une latitude et une longitude, parfois inconnu) à chaque lieu, et un lien « Voir sur la carte » sur chaque carte de lieu proposée par le chatbot. À la fin, le supporter clique sur ce lien et l'application de cartes de son téléphone s'ouvre, dans un nouvel onglet, sur le lieu ; un lieu sans emplacement n'a pas de lien. Le travail est découpé en cinq tâches : l'emplacement dans le domaine et la réponse de l'API (T01), son stockage en base (T02), les données de démonstration (T03), le composant du lien (T04), puis son ajout à la carte du lieu (T05). La carte intégrée, l'itinéraire et la position du supporter sont laissés de côté, comme dans la spec.

Les mots de la spec et leur nom dans le code :

| Dans la spec               | Dans le code      | Ce que c'est                                                           |
| -------------------------- | ----------------- | ---------------------------------------------------------------------- |
| emplacement                | `location`        | `{ latitude, longitude }` d'un lieu, ou `null` s'il est inconnu        |
| lieu proposé               | `PlaceSuggestion` | un lieu faisable renvoyé par le chatbot, qui gagne le champ `location` |
| lien « Voir sur la carte » | `PlaceMapLink`    | le composant qui affiche le lien, ou rien si `location` vaut `null`    |
| carte de lieu              | `PlaceCard`       | la carte du lieu dans la conversation, qui existe déjà                 |

## 2. Fichiers par couche

On ne crée pas de module : on complète le module `places` existant (un dossier par couche, comme le module Disciplines) et la fonctionnalité `chat` du front.

- **shared** : `packages/shared/src/places.ts` gagne `locationSchema` (`latitude` et `longitude`, deux nombres) et le champ `location: locationSchema.nullable()` dans `placeSuggestionSchema`.
- **domain** : `apps/api/src/modules/places/domain/place.ts` : `Place` reçoit la propriété `location` (un emplacement ou `null`) et un accesseur du même nom.
- **application** : `apps/api/src/modules/places/application/use-cases/find-reachable-places.ts` recopie `location` dans chaque lieu proposé, sans toucher au filtre ni au tri. `testing/in-memory-place.repository.ts` ne change pas.
- **infra** :
  - `infra/places.schema.ts` : deux colonnes facultatives, `latitude` et `longitude`.
  - `infra/place.mapper.ts` : `toDomain()` et `toRow()` convertissent les deux colonnes en `location` et inversement (`null` si l'une manque).
  - `apps/api/migrations/` : migration générée par `pnpm db:generate --name=place-location`, jamais éditée à la main.
  - `apps/api/data/places.json` : la latitude et la longitude de chaque lieu de démonstration (noms des colonnes en base).
- **http** : rien. `POST /api/chat` renvoie déjà `PlaceSuggestion`, qui contient maintenant `location`.
- **web** :
  - `apps/web/src/features/chat/components/place-map-link.tsx` : `PlaceMapLink` affiche un lien « Voir sur la carte » vers `https://www.google.com/maps/search/?api=1&query=<latitude>,<longitude>`, avec `target="_blank"` et `rel="noopener noreferrer"`, ou rien si `location` vaut `null`.
  - `features/chat/components/place-card.tsx` affiche `PlaceMapLink` sous les informations du lieu.
  - `apps/web/src/mocks/fixture.ts` : les lieux de la fausse API reçoivent `location` (l'un l'a, l'un vaut `null`).

## 3. Données

On stocke l'emplacement de chaque lieu dans la table `places`, qui existe déjà. La migration y ajoute deux colonnes :

- `latitude` : nombre à virgule (`double precision`), facultatif ;
- `longitude` : nombre à virgule (`double precision`), facultatif.

Aucune contrainte : un lieu sans emplacement a les deux colonnes vides (AS3), et la table reste valide pour les lieux déjà enregistrés. Pas d'index : on lit toujours tous les lieux.

## 4. Erreurs

Aucun refus métier dans la spec : un lieu sans emplacement n'est pas une erreur, il n'a simplement pas de lien. Aucune nouvelle `AppError`.

## 5. Tests par scénario

| Scénario | Fichier de test                                                          | Niveau      | Ce que le test vérifie                                                                                        |
| -------- | ------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------- |
| AS1      | `apps/api/src/modules/places/application/places.application.spec.ts`     | cas d'usage | un lieu proposé porte son `location` tel qu'il est enregistré                                                 |
| AS1      | `apps/api/src/modules/places/infra/drizzle-place.repository.int.spec.ts` | intégration | l'emplacement est écrit en base et relu à l'identique, `null` compris                                         |
| AS1      | `apps/api/test/places-location-data.spec.ts`                             | données     | chaque lieu de démonstration a une latitude et une longitude plausibles pour Dakar et ses environs            |
| AS2      | `apps/web/src/features/chat/components/place-map-link.test.tsx`          | écran       | le lien pointe vers l'application de cartes sur l'emplacement exact, s'ouvre dans un nouvel onglet            |
| AS2, AS3 | `apps/web/src/features/chat/components/chat-page.test.tsx`               | écran       | la carte d'un lieu avec emplacement affiche le lien ; celle d'un lieu sans emplacement garde ses informations |
| AS3      | `apps/web/src/features/chat/components/place-map-link.test.tsx`          | écran       | `PlaceMapLink` n'affiche rien quand `location` vaut `null`                                                    |
| AS4      | `apps/api/src/modules/places/application/places.application.spec.ts`     | cas d'usage | un lieu sans emplacement est proposé, dans le même ordre (retour le plus tôt d'abord) que les autres          |

## 6. Tâches

- [ ] T01 [002-AS1, AS4] Écrire d'abord, dans `places/application/places.application.spec.ts`, « 002-AS1: returns the location of each suggested place » et « 002-AS4: proposes a place without location in the same order », puis `locationSchema` et `location` dans `packages/shared/src/places.ts`, `location` dans `Place`, la recopie dans `FindReachablePlaces`, et `location` dans `mocks/fixture.ts` et dans les lieux de `apps/api/test/chat.e2e.spec.ts` pour que le typage passe
- [ ] T02 [002-AS1] Écrire d'abord `places/infra/drizzle-place.repository.int.spec.ts` (« 002-AS1: stores and restores the location of a place, null included »), puis les colonnes de `places.schema.ts`, le mapper et la migration `pnpm db:generate --name=place-location`
- [ ] T03 [002-AS1] Écrire d'abord `apps/api/test/places-location-data.spec.ts` (« 002-AS1: every demo place has a location around Dakar »), puis ajouter la latitude et la longitude de chaque lieu dans `apps/api/data/places.json`
- [ ] T04 [002-AS2, AS3] Écrire d'abord `features/chat/components/place-map-link.test.tsx` (« 002-AS2: links to the maps app on the exact place, in a new tab » et « 002-AS3: shows nothing when the location is unknown »), puis `PlaceMapLink`
- [ ] T05 [002-AS2, AS3] Écrire d'abord, dans `features/chat/components/chat-page.test.tsx`, « 002-AS2: a place card with a location shows a map link » et « 002-AS3: a place card without location keeps its details and shows no map link », puis ajouter `PlaceMapLink` dans `place-card.tsx`
