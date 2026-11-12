# Nouvelles fonctionnalités : qui fait quoi, et comment

Après la tranche 1 (le chatbot, spec `001`), le groupe ajoute deux fonctionnalités du [PRD](specs/prd-guide-dakar.md) :

- **TR4 — Voir le lieu sur la carte** : chaque lieu proposé par le chatbot a un lien « Voir sur la carte » ;
- **TR5 — L'agenda de la journée** : toutes les animations d'une journée des Jeux, triées par heure.

Ce fichier dit à chacun **ce qu'il fait, dans quels fichiers, et dans quel ordre**. Chaque fichier n'a qu'un propriétaire : c'est ce qui évite les conflits. Lis ta partie en entier avant de commencer.

## Qui fait quoi

| Personne                  | Ce qu'il livre                                                                                | Spec  |
| ------------------------- | --------------------------------------------------------------------------------------------- | ----- |
| Fallou Bousso             | les corrections de la spec 001 (T06 à T10), la refonte du design, la navigation               | `001` |
| `yandeG-dev`              | **TR4 en entier** : l'emplacement des lieux (données, API) et le lien « Voir sur la carte »   | `002` |
| `taphsirabdoulaye-source` | **TR5, côté API** : les contrats, le module `agenda`, la route `GET /api/agenda`, les données | `003` |
| `aminousy`                | **TR5, côté écran** : la page Agenda, la fausse API des tests, l'audit d'accessibilité        | `003` |

Fallou est aussi celui qui fusionne les pull requests dans `main`, après la relecture d'un autre membre.

## Avant de commencer (tout le monde)

1. `git switch main`, puis `git pull`. Le PRD doit être au statut `Validé` et contenir TR4 et TR5.
2. `pnpm install`, puis `pnpm check` doit être vert.
3. Dans Claude Code : `/clear` avant chaque nouvelle étape (spec, plan, tâche).
4. **Aucune nouvelle dépendance.** Aucun appel à Claude dans les tests.

## L'ordre, pour éviter les conflits

Trois points sont partagés : le numéro des specs, les migrations de la base et le fichier des lieux de démo. On les fait **chacun son tour** :

1. **Fallou** valide le PRD amendé, puis pousse sa correction T10 (`apps/api/data/places.json`). Personne d'autre ne touche à ce fichier avant.
2. **`yandeG-dev`** écrit la spec TR4 (`/spec TR4`) : elle prend le numéro `002`. Il la pousse **sur `main` dès qu'elle est validée**, puis fait de même pour le plan.
3. **`taphsirabdoulaye-source`** attend de voir `specs/002-*` après un `git pull`, puis écrit la spec TR5 (`/spec TR5`) : elle prend le numéro `003`. `aminousy` relit la spec et le plan avec lui.
4. **Migrations** : `yandeG-dev` génère la sienne en premier (`0002`) et la fait fusionner tout de suite. `taphsirabdoulaye-source` fait `git pull` **avant** de générer la sienne (`0003`).
5. **Contrats de l'agenda** : `taphsirabdoulaye-source` fusionne `packages/shared/src/agenda.ts` en premier. Ensuite, `aminousy` code l'écran en parallèle, avec la fausse API.
6. **Fallou** branche les deux fonctionnalités dans l'interface : le lien sur les cartes de lieux, l'onglet « Agenda » dans la navigation.

Les specs et les plans (fichiers de `specs/`) se poussent directement sur `main` une fois validés. **Le code passe toujours par une branche et une pull request.**

## TR4 — Voir le lieu sur la carte (`yandeG-dev`)

**Ce que voit le supporter** : sur chaque carte de lieu proposée par le chatbot, un lien « Voir sur la carte » ouvre l'application de cartes du téléphone sur ce lieu. Un lieu sans emplacement connu n'affiche pas de lien.

**Ce que tu donnes à `/spec TR4`** (à recopier) :

```
/spec TR4 Chaque lieu proposé par le chatbot a un emplacement (latitude, longitude). Sur sa carte, un lien « Voir sur la carte » ouvre l'application de cartes du téléphone sur ce lieu, dans un nouvel onglet. Un lieu sans emplacement connu n'affiche pas de lien. Pas de carte intégrée, pas d'itinéraire.
```

**Tes fichiers** (et seulement eux) :

- `packages/shared/src/places.ts` : ajoute à `placeSuggestionSchema` le champ `location: z.object({ latitude: z.number(), longitude: z.number() }).nullable()` ;
- `apps/api/src/modules/places/**` : l'emplacement dans `Place`, la table (`latitude`, `longitude`, facultatives), le mapper, et `FindReachablePlaces`, qui renvoie `location` ;
- `apps/api/migrations/**` : `pnpm db:generate --name=place-location` ;
- `apps/api/data/places.json` : la latitude et la longitude de chaque lieu (noms de colonnes en base : `latitude`, `longitude`), **après** la T10 de Fallou ;
- `apps/web/src/features/chat/components/place-map-link.tsx` et `place-map-link.test.tsx` : le composant `<PlaceMapLink place={place} />`, qui affiche le lien `https://www.google.com/maps/search/?api=1&query=<latitude>,<longitude>` (avec `target="_blank"` et `rel="noopener noreferrer"`), ou rien si `location` vaut `null` ;
- `apps/web/src/mocks/fixture.ts` : seulement l'ajout de `location` aux lieux existants.

**Ce que tu ne touches pas** : `place-card.tsx` (Fallou y ajoute ton composant, en une ligne), `styles.css` et `__root.tsx`.

**Branches** : `t-carte-api` pour l'API et la migration, puis `t-carte-lien` pour le composant.

## TR5 — L'agenda de la journée (`taphsirabdoulaye-source` et `aminousy`)

**Ce que voit le supporter** : une page « Agenda ». Il choisit une journée des Jeux et voit toutes les animations de ce jour, triées par heure de début, avec leur lieu et leur quartier. Une journée hors des Jeux est refusée.

**Ce que `taphsirabdoulaye-source` donne à `/spec TR5`** (à recopier) :

```
/spec TR5 Le supporter choisit une journée des Jeux (du 31 octobre au 13 novembre 2026) et voit toutes les animations de ce jour : titre, lieu, quartier, heure de début et de fin, triées par heure de début. Une journée sans animation affiche une liste vide. Une journée hors des Jeux est refusée : refus 422 avec le code AGENDA_DATE_OUTSIDE_GAMES. Une date illisible est refusée (400). Écran et API.
```

**Le contrat**, écrit en premier par `taphsirabdoulaye-source` dans `packages/shared/src/agenda.ts`, puis fusionné avant que `aminousy` commence :

```ts
// GET /api/agenda?date=2026-11-08 → 200, triées par startsAt.
export const agendaQuerySchema = z.object({ date: z.iso.date() });

export const agendaEventSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  place: z.string(), // le nom du lieu
  district: z.string(), // le quartier
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
});

export const agendaSchema = z.array(agendaEventSchema);
```

### Côté API (`taphsirabdoulaye-source`)

**Tes fichiers** :

- `packages/shared/src/agenda.ts`, son test, et **la ligne d'export** dans `packages/shared/src/index.ts` ;
- `apps/api/src/modules/agenda/**` : un module organisé comme `disciplines` (domaine, cas d'usage `GetDayAgenda`, repository en mémoire et Drizzle, table `agenda_events`, controller, module) ;
- `apps/api/src/app.module.ts` : l'ajout de `AgendaModule`, et rien d'autre ;
- `apps/api/migrations/**` : `pnpm db:generate --name=agenda-events`, **après** avoir récupéré la migration de `yandeG-dev` ;
- `apps/api/data/agenda_events.json` : au moins 12 animations sur 3 journées, dont une journée sans animation, avec les noms de colonnes en base (`starts_at`, `ends_at`…) ;
- `apps/api/test/agenda.e2e.spec.ts`.

**Branches** : `t-agenda-contrat` (le contrat seul, à fusionner vite), puis `t-agenda-api`.

### Côté écran (`aminousy`)

**Tes fichiers** :

- `apps/web/src/features/agenda/**` : l'appel `GET /api/agenda`, le hook TanStack Query, les composants (choix du jour, liste des animations) et leurs tests ;
- `apps/web/src/routes/agenda.tsx` et `apps/web/src/routes/agenda.a11y.test.tsx` ;
- `apps/web/src/mocks/agenda-handlers.ts` et `apps/web/src/mocks/agenda-fixture.ts` : la fausse route `GET /api/agenda` et ses données. Dans `mocks/handlers.ts`, **une seule ligne** pour ajouter tes handlers.

**Le design** : suis celui de Fallou. Utilise les couleurs et les classes déjà définies dans `styles.css` (`joj-hero`, `corner-cut`, `olympic-*`, `joj-*`) sans modifier ce fichier. S'il te manque une couleur ou une classe, demande-la à Fallou.

**Ce que tu ne touches pas** : `__root.tsx` (Fallou ajoute l'onglet « Agenda »), `styles.css` et les composants du chat.

**Branche** : `t-agenda-ecran`, créée **après** la fusion du contrat.

## Comment chacun travaille sa partie

1. Spec, puis plan, avec la méthode : `/spec`, relecture par un autre membre avec `task/GRILLE-RELECTURE.md`, « je valide », puis `/spec-plan`, relecture, « je valide ». Le plan reprend les fichiers de ta partie ci-dessus.
2. Pour chaque tâche : `git switch main`, `git pull`, `git switch -c <ta branche>`, puis `/tdd-task Tnn`. Claude écrit le test d'abord, le voit échouer, code, puis fait le commit.
3. `pnpm check` vert, `git push -u origin <ta branche>`, puis une pull request vers `main`. Un autre membre relit, Fallou fusionne.
4. À la fin de la tranche : l'auteur de la spec lance `/converge` sur `main`.

**Si git signale un conflit** :

- `apps/web/src/routeTree.gen.ts` est généré : garde n'importe quelle version, puis `pnpm build` le régénère ; commite le résultat ;
- `apps/api/migrations/**` : ne fusionne pas à la main. Supprime ta migration, `git pull`, puis relance `pnpm db:generate` ;
- tout autre fichier : c'est qu'un fichier a été touché hors de sa partie. Préviens son propriétaire au lieu de choisir à sa place.
