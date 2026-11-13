# 003 — L'agenda de la journée : plan

**Statut** : Validé

## 1. Résumé

On construit l'agenda des animations des Jeux : une route de l'API renvoie les animations d'une journée, triées par heure de début, et un nouvel onglet « Agenda » de l'application web les affiche. À la fin, le supporter choisit une journée entre le 31 octobre et le 13 novembre 2026 et voit, pour chaque animation, son titre, son lieu, son quartier, son heure de début et son heure de fin ; une journée vide ou une panne affiche un message clair. Le travail est découpé en six tâches, dans l'ordre des couches : le schéma partagé et le domaine, le cas d'usage, la table et le repository, la route et ses tests e2e, la fausse API du front, puis l'écran. Les filtres, la recherche, la saisie d'animations et les liens vers le chatbot ou la carte sont laissés de côté, comme le dit la spec.

Les mots de la spec et leur nom dans le code :

| Dans la spec                     | Dans le code                        | Ce que c'est                                                                        |
| -------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------- |
| animation                        | `AgendaEvent`                       | l'entité : un titre, un lieu, un quartier, une heure de début et une heure de fin   |
| titre                            | `title`                             | le nom de l'animation affiché au supporter                                          |
| lieu                             | `venue`                             | l'endroit où se tient l'animation (texte libre, sans lien avec la table `places`)   |
| quartier                         | `district`                          | le quartier du lieu, comme pour les lieux du chatbot                                |
| heure de début, heure de fin     | `startsAt`, `endsAt`                | deux instants ISO 8601 en UTC, qui est l'heure de Dakar                             |
| journée des Jeux                 | `AgendaDay`                         | une date `AAAA-MM-JJ` comprise entre le premier et le dernier jour des Jeux         |
| premier et dernier jour des Jeux | `GAMES_FIRST_DAY`, `GAMES_LAST_DAY` | `'2026-10-31'` et `'2026-11-13'`, partagés par l'API et le front                    |
| voir l'agenda d'une journée      | `GetDayAgenda`                      | le cas d'usage qui vérifie la journée, lit ses animations et les trie               |
| ordre de l'agenda                | `compareAgendaEvents`               | la règle de tri : heure de début, puis titre sans tenir compte de la casse, puis id |

## 2. Fichiers par couche

On crée le module `agenda`, organisé comme le module Disciplines : un dossier par couche. Le module `places`, qui sert lui aussi des données de démonstration en lecture seule, montre comment charger un fichier JSON et écrire un repository qui ne fait que lire.

Les propriétaires suivent `NOUVELLES-FONCTIONNALITES.md` : `taphsirabdoulaye-source` écrit les couches shared, domain, application, infra et http (T01 à T04, branches `t-agenda-contrat` puis `t-agenda-api`) ; `aminousy` écrit la couche web et la fausse API (T05, T06, T08, branche `t-agenda-ecran`) ; Fallou ajoute l'onglet « Agenda » dans `__root.tsx`. Une proposition de l'écran, écrite par erreur hors de sa partie, attend `aminousy` sur la branche `t-agenda-ecran-proposition` : il la reprend ou la supprime.

- **shared** : `packages/shared/src/agenda.ts` contient `GAMES_FIRST_DAY` et `GAMES_LAST_DAY` ; `dayAgendaQuerySchema` (`{ date }`, une date ISO `AAAA-MM-JJ` réelle, validée par `z.iso.date()`, qui refuse « 2026-13-45 », « demain » et l'absence de date) ; `agendaEventSchema` (`id`, `title`, `venue`, `district`, `startsAt`, `endsAt`) et `dayAgendaSchema`, la liste de ces animations. `packages/shared/src/index.ts` exporte le fichier. `packages/shared/src/agenda.spec.ts` teste le schéma de la date.
- **domain** :
  - `apps/api/src/modules/agenda/domain/agenda-day.ts` est l'objet valeur `AgendaDay` : `AgendaDay.of('2026-11-08')` refuse une date hors des Jeux avec `AGENDA_DATE_OUTSIDE_GAMES`, et donne le début de la journée (`2026-11-08T00:00:00Z`) et le début du lendemain, puisque Dakar est en UTC sans changement d'heure.
  - `apps/api/src/modules/agenda/domain/agenda-event.ts` est l'entité `AgendaEvent`, à constructeur privé, avec `create()`, utilisé par les tests, et `restore()`, utilisé par le mapper, et la fonction `compareAgendaEvents(a, b)` qui porte l'ordre de l'agenda.
  - `apps/api/src/modules/agenda/domain/agenda.errors.ts` contient `AgendaError`, sous-classe d'`AppError`, et sa fabrique `agendaDateOutsideGames(date)`.
- **application** :
  - `apps/api/src/modules/agenda/application/agenda-event.repository.ts` est le port `AgendaEventRepository`, avec une seule méthode : `findStartingBetween(from, to)`, qui renvoie les animations dont le début est au moins `from` et avant `to`.
  - `apps/api/src/modules/agenda/application/testing/in-memory-agenda-event.repository.ts` est le repository en mémoire des tests.
  - `apps/api/src/modules/agenda/application/use-cases/get-day-agenda.ts` est le cas d'usage `GetDayAgenda` : `execute(date)` construit l'`AgendaDay` (ce qui refuse une date hors des Jeux), demande au port les animations qui commencent dans la journée, puis les trie avec `compareAgendaEvents`.
- **infra** :
  - `apps/api/src/modules/agenda/infra/agenda-events.schema.ts` est la table Drizzle `agenda_events`.
  - `apps/api/src/modules/agenda/infra/agenda-event.mapper.ts` contient `toDomain()` et `toRow()`.
  - `apps/api/src/modules/agenda/infra/drizzle-agenda-event.repository.ts` est `DrizzleAgendaEventRepository`, qui filtre sur `starts_at` dans la base.
  - `apps/api/data/agenda_events.json` contient les animations de démonstration, chargées par `pnpm db:seed`.
- **http** : `apps/api/src/modules/agenda/http/agenda.controller.ts` expose `GET /api/agenda?date=AAAA-MM-JJ`. La route valide la requête avec un DTO tiré de `dayAgendaQuerySchema`, appelle `GetDayAgenda` et renvoie 200 avec `dayAgendaSchema`, une liste éventuellement vide. Une date illisible donne 400 `VALIDATION_FAILED` et une date hors des Jeux 422 `AGENDA_DATE_OUTSIDE_GAMES`, au format RFC 9457. `apps/api/src/modules/agenda/agenda.module.ts` relie `AgendaEventRepository` à `DrizzleAgendaEventRepository`, et `apps/api/src/app.module.ts` importe `AgendaModule`.
- **web** :
  - `apps/web/src/features/agenda/api/agenda.api.ts` fait l'appel `GET /api/agenda?date=…` et valide la réponse avec `dayAgendaSchema` ; `agenda.queries.ts` contient le hook `useDayAgenda(date)` (TanStack Query, clé `['agenda', date]`).
  - `apps/web/src/features/agenda/components/games-days.ts` liste les journées des Jeux et calcule la journée affichée à l'ouverture : celle du jour si elle est pendant les Jeux, sinon le 31 octobre.
  - `apps/web/src/features/agenda/components/agenda-page.tsx` est l'écran : un choix de la journée (`native-select`), la liste des animations, le message « Aucune animation n'est prévue ce jour-là » et le message d'erreur (`role="alert"`) qui laisse le choix de la journée utilisable.
  - `apps/web/src/features/agenda/components/agenda-event-card.tsx` affiche une animation ; `error-message.ts` traduit les codes d'erreur en phrases.
  - `apps/web/src/routes/agenda.tsx` est la page `/agenda`, avec le paramètre de recherche facultatif `?date=AAAA-MM-JJ` qui garde la journée choisie. L'onglet « Agenda » de `apps/web/src/routes/__root.tsx` est ajouté par Fallou ; les composants du chat ne sont pas modifiés.
  - `apps/web/src/mocks/agenda-fixture.ts` contient des animations de démonstration et `apps/web/src/mocks/agenda-handlers.ts` simule `GET /api/agenda`, avec les mêmes refus que l'API ; `apps/web/src/mocks/handlers.ts` ne reçoit qu'une ligne pour ajouter ces handlers.

## 3. Données

On stocke seulement les animations de démonstration, dans une table `agenda_events` :

| Colonne     | Type                     | Contrainte     | Règle protégée                                                                        |
| ----------- | ------------------------ | -------------- | ------------------------------------------------------------------------------------- |
| `id`        | uuid                     | clé primaire   | chaque animation a un identifiant, qui sert aussi au tri en dernier recours (AS8)     |
| `title`     | varchar(150)             | non nul        | chaque animation a un titre à afficher (AS1)                                          |
| `venue`     | varchar(100)             | non nul        | chaque animation dit où elle a lieu (AS1)                                             |
| `district`  | varchar(100)             | non nul        | chaque animation dit dans quel quartier (AS1)                                         |
| `starts_at` | timestamp with time zone | non nul, index | la journée d'une animation est celle de son début (AS2, AS9) ; l'index sert ce filtre |
| `ends_at`   | timestamp with time zone | non nul        | chaque animation a une heure de fin à afficher (AS1)                                  |

Aucune contrainte d'unicité sur le titre : une même animation peut revenir plusieurs jours. Le fichier `apps/api/data/agenda_events.json` contient au moins une animation le premier et le dernier jour des Jeux, deux animations à la même heure un même jour, et une animation qui finit après minuit. Migration : `pnpm db:generate --name=agenda-events`.

## 4. Erreurs

Le seul refus métier de la spec devient une `AppError` ; la date illisible est refusée avant, par le schéma partagé.

| Code AppError               | Catégorie     | HTTP | Quand                                                                 | Scénario |
| --------------------------- | ------------- | ---- | --------------------------------------------------------------------- | -------- |
| `AGENDA_DATE_OUTSIDE_GAMES` | BUSINESS_RULE | 422  | la date demandée est avant le 31 octobre ou après le 13 novembre 2026 | AS5      |

Une date absente, illisible ou impossible est refusée par `dayAgendaQuerySchema`, que `ProblemDetailsFilter` traduit en 400 `VALIDATION_FAILED` avec un message par champ dans `errors` (AS6).

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit, et par un test e2e ou d'écran quand le « Alors » parle d'un statut HTTP ou de ce que voit le supporter.

| Scénario | Fichier de test                                                                 | Niveau      | Ce que le test vérifie                                                                                          |
| -------- | ------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| AS1      | `apps/api/src/modules/agenda/application/agenda.application.spec.ts`            | unitaire    | trois animations à 20 h, 10 h et 15 h ressortent dans l'ordre 10 h, 15 h, 20 h                                  |
| AS1      | `apps/api/test/agenda.e2e.spec.ts`                                              | e2e         | 200, corps conforme à `dayAgendaSchema`, avec titre, lieu, quartier, début et fin                               |
| AS1      | `apps/web/src/features/agenda/components/agenda-page.test.tsx`                  | écran       | les trois animations affichées dans l'ordre, avec leurs cinq informations                                       |
| AS1      | `apps/web/src/routes/agenda.a11y.test.tsx`                                      | écran       | la liste des animations n'a aucun défaut d'accessibilité                                                        |
| AS2      | `apps/api/src/modules/agenda/infra/drizzle-agenda-event.repository.int.spec.ts` | intégration | sur des animations du 7, du 8 et du 9 novembre, seule celle du 8 est lue                                        |
| AS2      | `apps/api/src/modules/agenda/application/agenda.application.spec.ts`            | unitaire    | seule l'animation du 8 novembre est renvoyée                                                                    |
| AS3      | `apps/api/src/modules/agenda/application/agenda.application.spec.ts`            | unitaire    | une journée des Jeux sans animation donne une liste vide                                                        |
| AS3      | `apps/web/src/features/agenda/components/agenda-page.test.tsx`                  | écran       | l'écran affiche « Aucune animation n'est prévue ce jour-là »                                                    |
| AS4      | `apps/api/src/modules/agenda/domain/agenda-day.spec.ts`                         | unitaire    | le 31 octobre et le 13 novembre 2026 sont acceptés                                                              |
| AS4      | `apps/api/src/modules/agenda/application/agenda.application.spec.ts`            | unitaire    | l'animation du 31 octobre et celle du 13 novembre sont renvoyées pour leur journée                              |
| AS5      | `apps/api/src/modules/agenda/domain/agenda-day.spec.ts`                         | unitaire    | le 30 octobre et le 14 novembre sont refusés avec `AGENDA_DATE_OUTSIDE_GAMES`                                   |
| AS5      | `apps/api/test/agenda.e2e.spec.ts`                                              | e2e         | 422, code `AGENDA_DATE_OUTSIDE_GAMES`, format RFC 9457, aucune animation dans le corps                          |
| AS6      | `packages/shared/src/agenda.spec.ts`                                            | unitaire    | « 2026-13-45 », « demain » et l'absence de date sont refusés                                                    |
| AS6      | `apps/api/test/agenda.e2e.spec.ts`                                              | e2e         | 400, code `VALIDATION_FAILED`, avec un message sur le champ `date`                                              |
| AS7      | `apps/web/src/features/agenda/components/agenda-page.test.tsx`                  | écran       | une panne affiche un message d'erreur à la place de la liste ; choisir une autre journée affiche ses animations |
| AS7      | `apps/web/src/routes/agenda.a11y.test.tsx`                                      | écran       | le message d'erreur n'a aucun défaut d'accessibilité                                                            |
| AS8      | `apps/api/src/modules/agenda/application/agenda.application.spec.ts`            | unitaire    | à 15 h, « Concert » passe avant « fan zone » ; à titre égal, l'ordre suit l'identifiant                         |
| AS9      | `apps/api/src/modules/agenda/infra/drizzle-agenda-event.repository.int.spec.ts` | intégration | une animation du 8 novembre de 22 h à 1 h est lue pour le 8, pas pour le 9                                      |
| AS9      | `apps/api/src/modules/agenda/application/agenda.application.spec.ts`            | unitaire    | même règle avec le repository en mémoire                                                                        |

Les tests de la fausse API (`apps/web/src/mocks/handlers.test.ts`) vérifient en plus qu'elle tient le même contrat : tri, liste vide, 400 et 422.

## 6. Tâches

Six tâches, dans l'ordre des couches ; chacune tient dans un commit.

- [x] T01 [003-AS4, AS5, AS6] (`taphsirabdoulaye-source`) Écrire d'abord `packages/shared/src/agenda.spec.ts` (« 003-AS6: rejects an unreadable or missing date ») et `apps/api/src/modules/agenda/domain/agenda-day.spec.ts` (« 003-AS4: accepts the first and the last day of the Games », « 003-AS5: rejects a day outside the Games »), puis `packages/shared/src/agenda.ts`, son export, `AgendaDay`, `AgendaEvent`, `compareAgendaEvents` et `agenda.errors.ts`
- [x] T02 [003-AS1, AS2, AS3, AS4, AS8, AS9] (`taphsirabdoulaye-source`) Écrire d'abord `apps/api/src/modules/agenda/application/agenda.application.spec.ts` (« 003-AS1: lists the day's events by start time » et les suivants), avec le repository en mémoire, puis le port `AgendaEventRepository`, `InMemoryAgendaEventRepository` et `GetDayAgenda`
- [x] T03 [003-AS2, AS9] (`taphsirabdoulaye-source`) Écrire d'abord `apps/api/src/modules/agenda/infra/drizzle-agenda-event.repository.int.spec.ts` (« 003-AS2: reads only the events that start on the chosen day », « 003-AS9: keeps an event that ends after midnight on its start day »), puis la table `agenda_events`, la migration, le mapper, `DrizzleAgendaEventRepository` et `apps/api/data/agenda_events.json`
- [x] T04 [003-AS1, AS5, AS6] (`taphsirabdoulaye-source`) Écrire d'abord `apps/api/test/agenda.e2e.spec.ts` (« 003-AS1: returns the day's events sorted, with venue and district (200) », « 003-AS5: … (422, RFC 9457) », « 003-AS6: … (400, RFC 9457) »), puis `AgendaController`, `AgendaModule` et son ajout à `app.module.ts`
- [x] T05 [003-AS1, AS3, AS5, AS6] (`aminousy`) Écrire d'abord, dans `apps/web/src/mocks/handlers.test.ts`, les tests de `GET /api/agenda` (« 003-AS1: lists the day's events sorted by start time » et les suivants), puis `agenda-fixture.ts`, `agenda-handlers.ts` et la ligne qui les ajoute dans `handlers.ts`
- [x] T06 [003-AS1, AS3, AS7] (`aminousy`) Écrire d'abord `apps/web/src/features/agenda/components/agenda-page.test.tsx` et `apps/web/src/routes/agenda.a11y.test.tsx` (« 003-AS1: … », « 003-AS3: … », « 003-AS7: … »), puis l'appel HTTP, le hook, `games-days.ts`, l'écran, la carte d'une animation et la route `/agenda`

## 7. Corrections

### Passage 1

- [ ] T07 [003-AS1, AS7] (groupe : décision de Fallou, les fichiers touchés sont communs) Écrire d'abord rien de plus : des tests existants échouent déjà dans `pnpm check`, puis rendre la suite stable quand elle tourne en entier, par exemple en relevant `testTimeout` dans `apps/web/vite.config.mts` ou en limitant `maxWorkers` dans `vitest.config.mts`, jusqu'à deux `pnpm check` verts de suite (preuve : `pnpm check`, 6 « Test timed out in 5000ms » dans des audits axe et `chat-page.test.tsx`, une saisie mélangée dans « 001-AS5: sends the whole conversation with the next message », puis, avec `testTimeout: 20_000` et `maxWorkers: '50%'`, des e2e de l'API en « Hook timed out in 30000ms » une fois sur deux ; tous passent quand ils sont lancés seuls)
- [ ] T08 [003-AS7] (`aminousy`) Écrire d'abord, dans `apps/web/src/features/agenda/components/agenda-page.test.tsx`, « 003-AS7: ignores a day outside the Games in the address and opens the default day », puis n'accepter dans `validateSearch` de `apps/web/src/routes/agenda.tsx` que les journées des Jeux (relecteur : avec `/agenda?date=2026-11-14`, la liste déroulante affiche le 31 octobre sans pouvoir le choisir)
