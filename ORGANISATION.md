# Organisation du travail : TR1 à quatre

Ce document découpe la tranche 1 du [PRD](specs/prd-guide-dakar.md) (« Demander au chatbot quoi faire avant son épreuve ») en quatre parties, une par personne. Chaque partie a **ses propres fichiers** : personne ne modifie un fichier d'une autre partie, et les parties communiquent seulement par les **contrats** décrits plus bas. C'est ce qui évite les conflits à la fin.

## Qui fait quoi

La partie IA a été choisie par Fallou ; les trois autres ont été tirées au sort.

| Partie | Personne                  | Ce qu'elle livre                                                                                 | Tâche du plan |
| ------ | ------------------------- | ------------------------------------------------------------------------------------------------ | ------------- |
| A      | Fallou Bousso             | les contrats, puis l'intégration de Claude : comprendre le message, rédiger la réponse           | T01, T03      |
| B      | `yandeG-dev`              | les lieux : la règle « aller + visite + retour avant l'épreuve », la table, les données de démo  | T02           |
| C      | `taphsirabdoulaye-source` | l'API du chatbot : la route, le cas d'usage qui relie l'IA et les lieux, les tests e2e           | T04           |
| D      | `aminousy`                | l'écran de discussion : la page web du chatbot, la fausse API des tests, l'audit d'accessibilité | T05           |

## Les fichiers de chaque partie

Un fichier n'appartient qu'à une partie. Si tu as besoin de changer un fichier qui n'est pas à toi, demande à son propriétaire.

**A — Contrats et IA (Fallou)**

- `packages/shared/src/chat.ts`, `packages/shared/src/places.ts`, et leur export dans `packages/shared/src/index.ts`
- `apps/api/src/modules/chat/application/tourist-assistant.ts` : le port (classe abstraite)
- `apps/api/src/modules/chat/application/testing/fake-tourist-assistant.ts` : le faux, utilisé par tous les tests
- `apps/api/src/modules/chat/application/reachable-places.ts` : le port des lieux faisables, implémenté par la partie B
- `apps/api/src/modules/chat/domain/chat.errors.ts` : les erreurs `EVENT_TIME_PASSED` et `ASSISTANT_UNAVAILABLE`
- `apps/api/src/core/errors/` : la catégorie `UNAVAILABLE` (503)
- `apps/api/src/modules/chat/infra/claude-tourist-assistant.ts` : l'implémentation avec le SDK Claude, et ses instructions (prompt)
- `apps/api/src/core/config/` (lecture de `ANTHROPIC_API_KEY`), `apps/api/.env.example`
- `apps/api/package.json` et `pnpm-lock.yaml` : seule la partie A ajoute une dépendance, le SDK `@anthropic-ai/sdk`

**B — Lieux (`yandeG-dev`)**

- `apps/api/src/modules/places/**` : domaine (`Place`, la règle de temps), cas d'usage `FindReachablePlaces`, repository en mémoire et Drizzle, table, module Nest
- `apps/api/migrations/**` : la migration de la table des lieux (`pnpm db:generate --name=places`)
- `apps/api/data/places.json` : au moins 8 lieux de démo, dont au moins un trop loin pour le scénario de démo

**C — API du chatbot (`taphsirabdoulaye-source`)**

- `apps/api/src/modules/chat/application/use-cases/answer-chat-message.ts` : le cas d'usage
- `apps/api/src/modules/chat/application/clock.ts` : le port `Clock`, qui fixe l'heure dans les tests
- `apps/api/src/modules/chat/http/chat.controller.ts`, `apps/api/src/modules/chat/chat.module.ts`
- `apps/api/src/app.module.ts` : C ajoute **les deux** modules, `ChatModule` et `PlacesModule`
- `apps/api/test/chat.e2e.spec.ts`

**D — Écran (`aminousy`)**

- `apps/web/src/features/chat/**` : appels HTTP, hooks TanStack Query, composants
- `apps/web/src/routes/chat.tsx` (et ses tests), le lien dans `apps/web/src/routes/__root.tsx`, `apps/web/src/routeTree.gen.ts` (généré)
- `apps/web/src/mocks/**` : la fausse route `POST /api/chat` et ses données
- `apps/web/src/styles.css` (le thème), `apps/web/index.html` (la police), et les nouveaux composants de `apps/web/src/components/ui/`

## Le design de l'écran (partie D)

L'écran doit être **moderne, professionnel et aux couleurs des JOJ Dakar 2026**. L'identité officielle est sobre : du noir sur du blanc, une typographie très grasse et étroite, des cadres à coin coupé, une bulle de dialogue. Les cinq couleurs olympiques servent d'accents. Une bulle de dialogue, c'est justement un chatbot : on s'en sert.

**Les couleurs**, à définir comme variables du thème dans `apps/web/src/styles.css` (mode clair et mode sombre) :

| Rôle                        | Couleur         | Valeur    | Usage                                                    |
| --------------------------- | --------------- | --------- | -------------------------------------------------------- |
| Fond                        | blanc           | `#FFFFFF` | fond de page                                             |
| Texte et couleur principale | noir            | `#000000` | titres, texte, bouton d'envoi, bulles du supporter       |
| Accent 1                    | bleu olympique  | `#0081C8` | liens, focus, bulle du chatbot (bord ou fond très clair) |
| Accent 2                    | rouge olympique | `#EE334E` | erreurs (« le chatbot n'a pas compris »)                 |
| Accent 3                    | vert olympique  | `#00A651` | heure de retour « à temps » sur une carte de lieu        |
| Accent 4                    | jaune olympique | `#FCB131` | puces, soulignés décoratifs, jamais pour du texte        |

Le jaune et le vert sur fond blanc ne sont pas assez contrastés pour du texte : l'audit d'accessibilité (`*.a11y.test.tsx`) les refusera. On les garde pour des bordures, des pastilles et des fonds derrière du texte noir.

**La typographie** : titres en capitales, police étroite et très grasse comme le logo (`Barlow Condensed` ou `Oswald`, chargée par un `<link>` Google Fonts dans `apps/web/index.html`, sans nouvelle dépendance npm) ; texte courant dans la police du système.

**Les formes** :

- l'en-tête reprend le style du logo : « DAKAR 2026 » en noir, très gras, sur fond blanc ;
- les bulles du chat ont un **coin coupé** et une petite pointe, comme la bulle « Youth Olympic Games » ; bulles du supporter en noir à droite, bulles du chatbot en blanc bordé de bleu à gauche ;
- chaque lieu proposé est une **carte** : nom, quartier, durée de visite, trajet, et l'heure de retour mise en avant en vert ; une fine bande de couleur olympique sur le côté, qui change d'une carte à l'autre ;
- une zone de saisie fixée en bas, un bouton d'envoi noir, un indicateur « le chatbot écrit… » pendant l'attente ;
- un écran d'accueil avec deux ou trois exemples de questions cliquables (« Je suis à Diamniadio, mon match est à 17 h »).

**Ce qu'on ne fait pas** : on n'utilise ni les anneaux olympiques, ni le logo officiel, ni le nom « Youth Olympic Games » comme logo dans l'application. Ce sont des marques protégées. On reprend les couleurs et les formes, pas l'emblème.

**Mobile d'abord** : le supporter utilise son téléphone. L'écran doit être parfait à 375 px de large, puis s'élargir sur ordinateur.

## Les contrats

Ils sont écrits **en premier**, par la partie A (tâche T01), puis fusionnés dans `main`. Ensuite, chacun code contre eux sans attendre les autres. Les noms ci-dessous sont la cible ; `/spec-plan` peut les préciser, mais une fois T01 fusionnée, on ne les change plus sans prévenir le groupe.

**Le contrat HTTP** (`packages/shared/src/chat.ts`), entre C et D :

```ts
// POST /api/chat : toute la conversation est renvoyée à chaque message (pas de mémoire côté serveur).
export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(1000),
      }),
    )
    .min(1)
    .max(20),
});

export const placeSuggestionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  district: z.string(), // le quartier
  visitMinutes: z.number().int(),
  travelMinutes: z.number().int(), // trajet aller depuis le site du supporter
  backAt: z.iso.datetime(), // heure de retour au site
});

export const chatResponseSchema = z.object({
  reply: z.string(), // le texte du chatbot, rédigé par Claude
  places: z.array(placeSuggestionSchema), // la liste choisie par la règle de temps, affichée par l'écran
  missing: z.array(z.enum(['site', 'eventTime'])), // ce que le chatbot demande encore
});
```

**Les sites olympiques** (`packages/shared/src/places.ts`), entre A, B et C :

```ts
export const OLYMPIC_SITES = ['dakar', 'diamniadio', 'saly'] as const;
```

**Le port de l'IA** (`chat/application/tourist-assistant.ts`), entre A et C :

```ts
export interface VisitorRequest {
  site: OlympicSite | null; // null : le supporter ne l'a pas dit
  eventTime: Date | null; // l'heure de sa prochaine épreuve
  now: Date | null; // l'heure qu'il a donnée, sinon null (C prend l'heure du serveur)
}

export abstract class TouristAssistant {
  abstract understand(messages: ChatMessage[]): Promise<VisitorRequest>;
  abstract reply(input: {
    request: VisitorRequest;
    places: PlaceSuggestion[];
    missing: Missing[];
  }): Promise<string>;
}
```

La réponse de Claude ne choisit jamais les lieux : elle reçoit la liste de `FindReachablePlaces` et la présente.

**Le port des lieux faisables** (`chat/application/reachable-places.ts`, écrit par A), entre B et C. B l'implémente avec `FindReachablePlaces`, exporté par `PlacesModule` ; C le reçoit par injection et le remplace par un faux dans ses tests :

```ts
export abstract class ReachablePlaces {
  // Un lieu est retenu si now + trajet aller + visite + trajet retour <= eventTime. Tri : retour le plus tôt d'abord.
  abstract find(input: {
    site: OlympicSite;
    now: Date;
    eventTime: Date;
  }): Promise<PlaceSuggestion[]>;
}
```

## Dans quel ordre

1. **Fallou (pilote de la tranche)** amende et fait valider le PRD (`/prd`), puis lance `/spec TR1` et `/spec-plan`. Le groupe relit la spec et le plan avec la grille avant chaque « je valide ». Le plan doit reprendre ces cinq tâches et ces propriétaires (donne-lui ce fichier en précision).
2. **T01, contrats (A)** : Fallou écrit les schémas partagés, le port et le faux, puis fusionne dans `main`. C'est la seule tâche qui bloque les autres ; elle doit être courte.
3. **En parallèle**, chacun sur sa branche depuis `main` à jour :
   - T02, lieux (B), branche `t02-lieux` ;
   - T03, Claude (A), branche `t03-claude` ;
   - T04, API du chatbot (C), branche `t04-api-chat` : les tests utilisent le faux assistant et un faux `FindReachablePlaces` en attendant T02 ;
   - T05, écran (D), branche `t05-ecran-chat` : les tests utilisent la fausse API MSW, pas la vraie.
4. **Fusion**, dans cet ordre : T02, T03, T04, puis T05. Après chaque fusion, les autres font `git pull --rebase origin main` sur leur branche.
5. **Fin** : Fallou lance `/converge` sur `main` ; `pnpm check` doit être vert, puis la démo avec `pnpm dev`.

## Comment chacun travaille sa partie

1. `git switch main`, `git pull`, `git switch -c <ta branche>`.
2. Dans Claude Code : `/clear`, puis `/tdd-task T0n` avec **ton** numéro de tâche. Claude écrit le test d'abord, le voit échouer, code, puis fait le commit.
3. Ne touche qu'aux fichiers de ta partie. Si le test d'une autre partie casse chez toi, préviens son propriétaire au lieu de le corriger.
4. `pnpm check` vert, `git push -u origin <ta branche>`, puis ouvre une pull request vers `main`. Un autre membre la relit et la fusionne.

**Le seul conflit attendu** : la case cochée de ta tâche dans `specs/001-*/plan.md`. Si git le signale, garde les cases cochées des deux côtés.

**Tests et IA** : aucun test n'appelle Claude, tous passent par `FakeTouristAssistant`. Seul Fallou essaie le vrai appel, quelques fois, à la main dans Swagger, avec sa clé dans `apps/api/.env`.
