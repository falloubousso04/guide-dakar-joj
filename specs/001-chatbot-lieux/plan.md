# 001 — Demander au chatbot quoi faire avant son épreuve : plan

**Statut** : Validé

## 1. Résumé

On construit un chatbot : le supporter envoie sa conversation à l'API, Claude en tire le site olympique, l'heure de l'épreuve et l'heure qu'il est, l'application choisit les lieux faisables par une règle de temps, puis Claude rédige la réponse. À la fin, le supporter discute avec le chatbot sur un écran web et reçoit une carte par lieu qu'il peut visiter en revenant à temps. Le travail est découpé en cinq tâches, une par partie de `ORGANISATION.md` : T01 pose les contrats et doit être fusionnée en premier, puis T02 à T05 avancent en parallèle. Les envies du supporter, les animations, les horaires d'ouverture et une marge au retour sont laissés de côté.

Les mots de la spec et leur nom dans le code :

| Dans la spec            | Dans le code          | Ce que c'est                                                          |
| ----------------------- | --------------------- | --------------------------------------------------------------------- |
| site olympique          | `OlympicSite`         | `'dakar' \| 'diamniadio' \| 'saly'`                                   |
| lieu                    | `Place`               | un lieu à visiter : nom, quartier, durée de visite, trajets par site  |
| lieu proposé            | `PlaceSuggestion`     | un lieu faisable, avec son trajet depuis le site et l'heure de retour |
| heure de l'épreuve      | `eventTime`           | l'heure de la prochaine épreuve du supporter                          |
| ce que dit le supporter | `VisitorRequest`      | le site, l'heure de l'épreuve et l'heure actuelle, tirés par Claude   |
| l'IA                    | `TouristAssistant`    | le port qui comprend la conversation et rédige la réponse             |
| répondre au message     | `AnswerChatMessage`   | le cas d'usage qui relie l'IA et les lieux                            |
| lieux faisables         | `FindReachablePlaces` | le cas d'usage qui applique la règle de temps                         |

## 2. Fichiers par couche

On crée deux modules organisés comme le module Disciplines, un dossier par couche : `places` (les lieux et la règle de temps) et `chat` (le chatbot). Le propriétaire de chaque fichier est indiqué entre crochets : A Fallou Bousso, B `yandeG-dev`, C `taphsirabdoulaye-source`, D `aminousy`.

- **shared** [A] : `packages/shared/src/places.ts` contient `OLYMPIC_SITES` et `placeSuggestionSchema` ; `packages/shared/src/chat.ts` contient `chatRequestSchema` (de 1 à 20 messages, chacun de 1 à 1000 caractères après suppression des espaces), `chatResponseSchema` (`reply`, `places`, `missing`) et `missingInfoSchema` (`'site' | 'eventTime'`) ; les deux sont exportés par `index.ts`.
- **core** [A] : `core/errors/app-error.ts` gagne la catégorie `UNAVAILABLE`, que `problem-details.filter.ts` traduit en 503 ; `core/config/app-config.ts` lit `ANTHROPIC_API_KEY`, facultative pour que `pnpm check` tourne sans clé.
- **domain** : `modules/places/domain/place.ts` [B] est l'entité `Place`, avec `create()`, `restore()` et `returnTime(site, now)`, qui calcule now + aller + visite + retour ; `place.errors.ts` [B] contient ses erreurs de validation. `modules/chat/domain/chat.errors.ts` [A] contient `ChatError` avec `EVENT_TIME_PASSED` (BUSINESS_RULE) et `ASSISTANT_UNAVAILABLE` (UNAVAILABLE).
- **application** :
  - `modules/chat/application/tourist-assistant.ts` [A] est le port de l'IA : `understand(messages)` renvoie un `VisitorRequest`, et `reply({ request, places, missing })` renvoie le texte du chatbot ; les deux lèvent `ASSISTANT_UNAVAILABLE` si Claude ne répond pas.
  - `modules/chat/application/testing/fake-tourist-assistant.ts` [A] est le faux, que le test règle : la demande à renvoyer, le texte à renvoyer, ou une panne.
  - `modules/chat/application/reachable-places.ts` [A] est le port `ReachablePlaces`, avec `find({ site, now, eventTime })`, dont `chat` a besoin ; `places` l'implémente.
  - `modules/chat/application/clock.ts` [C] est le port `Clock` (`now()`), remplacé dans les tests pour fixer l'heure d'envoi.
  - `modules/chat/application/use-cases/answer-chat-message.ts` [C] demande au port de l'IA de comprendre la conversation, liste ce qui manque, refuse une épreuve passée, appelle `ReachablePlaces`, puis demande la réponse.
  - `modules/places/application/place.repository.ts`, `testing/in-memory-place.repository.ts` et `use-cases/find-reachable-places.ts` [B] : `FindReachablePlaces` implémente `ReachablePlaces`, garde les lieux dont le retour est au plus tard à l'heure de l'épreuve, et les trie par retour le plus tôt.
- **infra** : `modules/places/infra/places.schema.ts`, `place.mapper.ts` et `drizzle-place.repository.ts` [B] ; `modules/chat/infra/claude-tourist-assistant.ts` [A] implémente le port avec le SDK `@anthropic-ai/sdk`, modèle `claude-opus-5-5`, à travers deux outils au format JSON (l'extraction de la demande, puis la réponse rédigée à partir de la liste fournie).
- **http** [C] : `modules/chat/http/chat.controller.ts` expose `POST /api/chat`, qui valide `chatRequestSchema` et renvoie 200 avec `chatResponseSchema`. `chat.module.ts` relie `TouristAssistant` à `ClaudeTouristAssistant`, `ReachablePlaces` à `FindReachablePlaces` (exporté par `PlacesModule` [B]) et `Clock` à l'horloge système ; `app.module.ts` importe les deux modules.
- **web** [D] : `apps/web/src/features/chat/` contient l'appel `POST /api/chat`, le hook TanStack Query et les composants (conversation, bulle, carte de lieu, zone de saisie). `apps/web/src/routes/chat.tsx` est la page, avec le lien dans `__root.tsx`. `mocks/handlers.ts` simule `POST /api/chat`. Le thème est dans `styles.css` et la police dans `index.html`, selon la charte de `ORGANISATION.md`.

## 3. Données

On stocke seulement les lieux de démonstration. La table `places` a les colonnes `id` (uuid, clé primaire), `name` (varchar 100, unique, pour que deux lieux ne se confondent pas dans la réponse), `district` (varchar 100), `visit_minutes` (entier, au moins 1) et `travel_minutes` (jsonb `{ dakar, diamniadio, saly }`, un entier positif par site, vérifié par le domaine). Les données sont dans `apps/api/data/places.json`, avec au moins 8 lieux, dont un dont l'aller-retour plus la visite depuis Diamniadio fait plus de 6 h, et un qui fait exactement 5 h 30. Migration : `pnpm db:generate --name=places`.

## 4. Erreurs

| Code AppError           | Catégorie     | HTTP | Quand                                                | Scénario |
| ----------------------- | ------------- | ---- | ---------------------------------------------------- | -------- |
| `EVENT_TIME_PASSED`     | BUSINESS_RULE | 422  | l'heure de l'épreuve est avant l'heure actuelle      | AS8      |
| `ASSISTANT_UNAVAILABLE` | UNAVAILABLE   | 503  | Claude ne répond pas, ou aucune clé n'est configurée | AS9      |

Un message vide est refusé par `chatRequestSchema` (400, `VALIDATION_FAILED`) ; l'écran ne l'envoie pas (AS11).

## 5. Tests par scénario

| Scénario | Fichier de test                                                 | Niveau        | Ce que le test vérifie                                               |
| -------- | --------------------------------------------------------------- | ------------- | -------------------------------------------------------------------- |
| AS1      | `places/application/places.application.spec.ts`                 | unitaire      | lieux faisables triés par heure de retour, avec trajet et retour     |
| AS1      | `apps/api/test/chat.e2e.spec.ts`                                | e2e           | 200, `reply` et `places` conformes au schéma                         |
| AS2      | `places/domain/place.spec.ts`                                   | unitaire      | un lieu de 6 h n'est pas faisable entre 11 h 30 et 17 h              |
| AS3      | `places/domain/place.spec.ts`                                   | unitaire      | un lieu de 5 h 30 exactement est faisable, retour à 17 h 00          |
| AS4      | `chat/application/chat.application.spec.ts`                     | unitaire      | site ou heure manquant : `missing` les liste, `places` est vide      |
| AS5      | `chat/application/chat.application.spec.ts`                     | unitaire      | l'IA reçoit toute la conversation                                    |
| AS6      | `chat/application/chat.application.spec.ts`                     | unitaire      | sans heure donnée, la recherche part de l'heure de `Clock`           |
| AS7      | `places/application/places.application.spec.ts`                 | unitaire      | une épreuve dans 20 min donne une liste vide                         |
| AS8      | `chat/application/chat.application.spec.ts`, `chat.e2e.spec.ts` | unitaire, e2e | refus 422 `EVENT_TIME_PASSED`                                        |
| AS9      | `core/errors/problem-details.filter.spec.ts`                    | unitaire      | `UNAVAILABLE` donne 503                                              |
| AS9      | `chat/infra/claude-tourist-assistant.spec.ts`                   | unitaire      | une panne du client SDK devient `ASSISTANT_UNAVAILABLE`              |
| AS9      | `apps/api/test/chat.e2e.spec.ts`                                | e2e           | 503 `ASSISTANT_UNAVAILABLE` quand le faux est en panne               |
| AS10     | `apps/web/src/features/chat/components/chat-page.test.tsx`      | écran         | message affiché, indicateur d'attente, réponse et une carte par lieu |
| AS10     | `apps/web/src/routes/chat.a11y.test.tsx`                        | écran         | aucun défaut d'accessibilité                                         |
| AS11     | `packages/shared/src/chat.spec.ts`                              | unitaire      | un message vide ou fait d'espaces est refusé                         |
| AS11     | `apps/web/src/features/chat/components/chat-page.test.tsx`      | écran         | rien n'est envoyé, la conversation ne change pas                     |

## 6. Tâches

- [x] T01 [001-AS9, AS11] (A, Fallou) Écrire d'abord `packages/shared/src/chat.spec.ts` (« 001-AS11: rejects a blank message ») et le cas 503 de `problem-details.filter.spec.ts` (« 001-AS9: maps UNAVAILABLE to 503 »), puis les schémas partagés, la catégorie `UNAVAILABLE`, `chat.errors.ts`, les ports `TouristAssistant` et `ReachablePlaces`, et `FakeTouristAssistant`
- [x] T02 [001-AS1, AS2, AS3, AS7] (B, `yandeG-dev`) Écrire d'abord `places/domain/place.spec.ts` (« 001-AS2: … », « 001-AS3: … ») et `places/application/places.application.spec.ts` (« 001-AS1: … », « 001-AS7: … »), puis `Place`, `FindReachablePlaces`, le repository Drizzle, la table, la migration, `data/places.json` et `PlacesModule`
- [x] T03 [001-AS9] (A, Fallou) Écrire d'abord `chat/infra/claude-tourist-assistant.spec.ts` (« 001-AS9: turns an SDK failure into ASSISTANT_UNAVAILABLE »), avec un faux client SDK, puis `ClaudeTouristAssistant`, la lecture de `ANTHROPIC_API_KEY` et l'ajout du SDK
- [x] T04 [001-AS1, AS4, AS5, AS6, AS8, AS9] (C, `taphsirabdoulaye-source`) Écrire d'abord `chat/application/chat.application.spec.ts` et `apps/api/test/chat.e2e.spec.ts` (« 001-AS4: … » et suivants), avec `FakeTouristAssistant`, puis `AnswerChatMessage`, `Clock`, `ChatController`, `ChatModule` et `app.module.ts`
- [x] T05 [001-AS10, AS11] (D, `aminousy`) Écrire d'abord `features/chat/components/chat-page.test.tsx` et `routes/chat.a11y.test.tsx` (« 001-AS10: … », « 001-AS11: … »), avec la fausse API MSW, puis l'écran du chatbot, le thème et la police

## 7. Corrections

### Passage 1

- [x] T06 [001-AS1, AS3] Écrire d'abord, dans `places/application/places.application.spec.ts`, « 001-AS1: sorts the reachable places by return time » avec des lieux donnés dans le désordre, et « 001-AS3: proposes a place that brings the supporter back exactly at the event time » qui vérifie le lieu de 5 h 30 dans la liste avec `backAt` à 17:00, puis corriger `FindReachablePlaces` si besoin (relecteur : `places.application.spec.ts:20-37`, le tri et l'égalité ne sont pas prouvés par `find()`)
- [x] T07 [001-AS7] Écrire d'abord, dans `chat/application/chat.application.spec.ts`, « 001-AS7: asks the assistant to say that nothing fits » (l'IA reçoit `places: []` et `missing: []`), et dans `chat/infra/claude-tourist-assistant.spec.ts` « 001-AS7: tells Claude to say that no place fits » (la consigne est envoyée), puis corriger si besoin (relecteur : seule la liste vide était vérifiée)
- [x] T08 [001-AS5] Écrire d'abord, dans `features/chat/components/chat-page.test.tsx`, « 001-AS5: sends at most the last 20 messages of a long conversation », puis limiter l'envoi aux `CHAT_MAX_MESSAGES` derniers messages dans `chat-page.tsx` (relecteur : `chat-page.tsx:26-33`, au 11e message l'API répond 400 et le chat reste bloqué)
- [x] T09 [001-AS10] Écrire d'abord, dans `routes/chat.a11y.test.tsx` ou un test de route, « 001-AS10: the home page opens the chatbot » et « 001-AS10: the menu only shows the chatbot », pour couvrir la redirection de `/` et le menu (relecteur : commits `a075310` et `a118186` hors plan)
- [x] T10 [001-AS3] Écrire d'abord `apps/api/test/places-data.spec.ts` (« 001-AS3: the demo data has a place that takes exactly 5 h 30 from Diamniadio, and one that takes more than 6 h »), puis compléter `apps/api/data/places.json` (relecteur : aucun lieu ne fait 330 min depuis Diamniadio, comme le demande le §3)
