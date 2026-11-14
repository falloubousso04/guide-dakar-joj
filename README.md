# Guide de Dakar — JOJ Dakar 2026

- **Le problème et pour qui** : un supporter étranger, à Dakar pour la première fois, a quelques heures libres entre deux épreuves et ne sait pas quoi visiter sans risquer de rater son match. Notre chatbot lui propose seulement les lieux où l'aller, la visite et le retour tiennent avant son épreuve.
- **Lancer** : `pnpm install`, puis `pnpm db:seed` et `pnpm dev`, puis ouvrir http://localhost:5173 (la clé de l'API Claude va dans `apps/api/.env`, voir plus bas).
- **Ce qui manque** : les envies du supporter (TR2) et les animations en cours dans le chatbot (TR3) ; les horaires d'ouverture des lieux et une marge de sécurité au retour ne sont pas encore pris en compte.

| Lien                    | Adresse                                           |
| ----------------------- | ------------------------------------------------- |
| Application en ligne    | https://guide-dakar-joj.vercel.app                |
| API et sa documentation | https://guide-dakar-joj.onrender.com/api/docs     |
| Code source             | https://github.com/falloubousso04/guide-dakar-joj |

> L'API est hébergée sur une offre gratuite : après une période sans visite, le premier message peut prendre jusqu'à une minute, le temps que le serveur se réveille.

Projet de groupe de l'atelier C du bootcamp Claude Code (thème **Guide touristique de Dakar**), construit pour les organisateurs des Jeux Olympiques de la Jeunesse Dakar 2026.

## Ce que fait l'application

| Le chatbot                               | L'agenda de la journée                | Comment ça marche                                         |
| ---------------------------------------- | ------------------------------------- | --------------------------------------------------------- |
| ![Le chatbot](docs/captures/chatbot.png) | ![L'agenda](docs/captures/agenda.png) | ![Comment ça marche](docs/captures/comment-ca-marche.png) |

- **Le chatbot** : le supporter écrit comme il parlerait à un habitant (« je suis à Diamniadio, il est 11 h 30, mon match est à 17 h »). Claude comprend la phrase et rédige la réponse ; **l'application, et non l'IA, choisit les lieux** : un lieu n'est proposé que si aller + visite + retour tiennent avant l'épreuve. S'il manque le site ou l'heure, le chatbot les demande. Chaque lieu a sa carte : durée de visite, trajet, heure de retour, et un lien **« Voir sur la carte »**.
- **L'agenda** : toutes les animations d'une journée des Jeux (concerts, fan zones), triées par heure de début, avec leur lieu et leur quartier.
- **Mobile d'abord** : barre d'onglets en bas de l'écran sur téléphone, couleurs et formes de l'identité des JOJ.

## Où en est le produit

Le PRD du groupe est dans [specs/prd-guide-dakar.md](specs/prd-guide-dakar.md). Chaque tranche suit la méthode du bootcamp : spec, plan, code en TDD, puis `/converge` avec un relecteur indépendant.

| Tranche | Ce qu'on livre                                              | Spec                                    | État           |
| ------- | ----------------------------------------------------------- | --------------------------------------- | -------------- |
| TR1     | Demander au chatbot quoi faire avant son épreuve            | [001](specs/001-chatbot-lieux/spec.md)  | ✅ Implémentée |
| TR4     | Voir le lieu sur la carte                                   | [002](specs/002-carte-lieu/spec.md)     | ✅ Implémentée |
| TR5     | L'agenda de la journée                                      | [003](specs/003-agenda-journee/spec.md) | ✅ Implémentée |
| TR2     | Le chatbot tient compte des envies                          | –                                       | à venir        |
| TR3     | Ce qui se passe maintenant : les animations dans le chatbot | –                                       | à venir        |

`pnpm check` (format, lint, types, 257 tests, build) est vert, et `pnpm spec:check specs/<spec> --trace` montre le test de chaque scénario.

## L'équipe

| Personne                  | Ce qu'il a construit                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Fallou Bousso             | le PRD, les contrats, l'intégration de Claude, la refonte du design, l'intégration finale |
| `yandeG-dev`              | les lieux et la règle de temps, puis « Voir sur la carte »                                |
| `taphsirabdoulaye-source` | l'API du chatbot, puis l'agenda (API et écran)                                            |
| `aminousy`                | l'écran du chatbot, puis la fausse API et les corrections de l'agenda                     |

La répartition et les règles de travail sont dans [ORGANISATION.md](ORGANISATION.md) (tranche 1) et [NOUVELLES-FONCTIONNALITES.md](NOUVELLES-FONCTIONNALITES.md) (tranches 4 et 5).

## Lancer en local

1. `git clone https://github.com/falloubousso04/guide-dakar-joj.git`, puis `cd guide-dakar-joj`.
2. `pnpm install`, puis `pnpm exec lefthook install` (le hook de pré-commit).
3. Copier `apps/api/.env.example` en `apps/api/.env`, puis y mettre sa clé : `ANTHROPIC_API_KEY=sk-ant-…`. Sans clé, l'application tourne, mais le chatbot répond qu'il n'a pas pu répondre (503).
4. `pnpm db:seed` (lieux et animations de démo), puis `pnpm dev`, et ouvrir http://localhost:5173.
5. `pnpm check` vérifie tout le dépôt. Aucun test n'appelle Claude : l'IA est remplacée par un faux dans les tests.

## Comment c'est construit

- **API** NestJS (`apps/api`) : un module par domaine (`places`, `chat`, `agenda`), découpé en `domain/`, `application/`, `infra/` et `http/` ; le chatbot passe par un port `TouristAssistant`, implémenté avec le SDK Claude (`claude-opus-5-5`).
- **Front** React (`apps/web`) : TanStack Router et Query, Tailwind ; une fausse API MSW pour les tests et un audit d'accessibilité par écran.
- **Schémas partagés** Zod (`packages/shared`), utilisés par l'API comme par le front.
- **Mise en ligne** : le front sur Vercel (`apps/web/vercel.json` redirige `/api` vers l'API), l'API sur Render avec une base PostgreSQL ; en local, une base PGlite embarquée.

## Règles de travail du groupe

- Toute fonctionnalité suit `/prd` → `/spec` → `/spec-plan` → `/tdd-task` → `/converge` (principes dans `specs/constitution.md`, relecture avec `task/GRILLE-RELECTURE.md`).
- Une branche à jour de `main` par tâche, `pnpm check` vert, puis une pull request relue par un autre membre.
- Messages Conventional Commits, jamais `--no-verify`. Une migration se génère après un `git pull`, avec `pnpm db:generate --name=<sujet>`.
- Aucun secret dans le dépôt : chacun garde sa clé dans `apps/api/.env`, ignoré par git.

---

# Base technique : repo de départ du bootcamp

Un monorepo pnpm : une API NestJS, un front React et des schémas partagés. Une fonctionnalité d'exemple, **Disciplines**, montre toute la chaîne, du schéma partagé à l'écran.

Les énoncés de la formation (prise en main, ateliers A, B et C) et la description du projet sont dans [`task/`](task/README.md).

## Prérequis

- **Node 24 LTS** (`node -v` doit afficher `v24.x`). Avec nvm : `nvm use`.
- **pnpm**, via corepack (fourni avec Node) : `corepack enable`.
- **Git**.

Docker est facultatif (voir [Base de données](#base-de-données)).

## Installer et lancer

```bash
pnpm install
pnpm dev
```

Puis ouvrir :

- le front : http://localhost:5173
- l'API : http://localhost:3000/api (santé : `/api/health`)
- la doc de l'API (Swagger, pour essayer les routes) : http://localhost:3000/api/docs

Pour des données de démo : arrêter `pnpm dev` (Ctrl+C), lancer `pnpm db:seed`, puis relancer `pnpm dev`.

## Commandes

| Commande           | Effet                                                                |
| ------------------ | -------------------------------------------------------------------- |
| `pnpm dev`         | API (port 3000) et front (port 5173) en parallèle                    |
| `pnpm test`        | tous les tests (Vitest), sans Docker ni réseau                       |
| `pnpm test:watch`  | les tests en continu                                                 |
| `pnpm lint`        | oxlint                                                               |
| `pnpm format`      | formate tout (oxfmt) ; `pnpm format:check` vérifie seulement         |
| `pnpm typecheck`   | TypeScript sur tout le repo                                          |
| `pnpm build`       | build de l'API (SWC) et du front (Vite)                              |
| `pnpm check`       | tout le dépôt : format, lint, types, tous les tests, build           |
| `pnpm verify`      | les seuls fichiers modifiés : format, lint, types, tests liés        |
| `pnpm db:generate` | génère une migration après un changement de schéma Drizzle           |
| `pnpm db:seed`     | applique les migrations et charge `apps/api/data/*.json`             |
| `pnpm db:reset`    | vide la base locale, applique les migrations et recharge les données |

## Structure

```
apps/
  api/                      NestJS 11 + Drizzle
    src/core/               transverse : config, erreurs (AppError, RFC 9457), base, santé
    src/modules/<domaine>/  un module Nest par domaine (voir ci-dessous)
    migrations/             générées par drizzle-kit, jamais éditées à la main
    data/                   jeux de données JSON chargés par db:seed
    test/                   tests e2e de l'API (supertest)
  web/                      React 19 + Vite
    src/routes/             pages (TanStack Router, un fichier = une route)
    src/features/<nom>/     api/ (appels HTTP et hooks TanStack Query) et components/
    src/components/ui/      composants shadcn
    src/lib/api/            client HTTP typé
    src/mocks/              la fausse API des tests (MSW), au même contrat que apps/api
    src/test/               setup Vitest, fonctions de rendu, audit d'accessibilité
packages/
  shared/                   schémas Zod et types partagés par l'API et le front
specs/                      constitution et specs des fonctionnalités (voir Méthode)
task/                       énoncés de la formation : exercices, ateliers A, B, C, description du projet
tools/sdd/                  scripts des skills : spec:check, tdd:red, verify
.claude/                    hooks, skills et sous-agent relecteur de Claude Code
```

Un module de domaine de l'API, par exemple `src/modules/disciplines/` :

```
domain/        entités et règles métier, TypeScript pur (aucun import de Nest ni de Drizzle : vérifié par le lint)
  discipline.ts            Discipline.create() applique les règles, Discipline.restore() relit la base
  disciplines.errors.ts    DisciplineError extends AppError : codes stables et catégorie
application/   cas d'usage, un par classe, méthode execute()
  discipline.repository.ts port : classe abstraite, ce dont les cas d'usage ont besoin
  use-cases/               Create, List, Get, Update, DeleteDiscipline
  testing/                 repository en mémoire, pour tester sans base
infra/         persistance
  disciplines.schema.ts    table Drizzle (lue par drizzle-kit)
  discipline.mapper.ts     toDomain() et toRow()
  drizzle-discipline.repository.ts
http/          controller fin : valider (DTO zod), appeler un cas d'usage, sérialiser
disciplines.module.ts      relie le port à son implémentation Drizzle
```

Une erreur métier est une `AppError` (code stable + catégorie VALIDATION, NOT_FOUND, CONFLICT ou BUSINESS_RULE). Le `ProblemDetailsFilter` est le seul endroit où elle devient une réponse HTTP (400, 404, 409, 422, au format RFC 9457).

## Base de données

**Par défaut : PGlite**, un PostgreSQL complet qui tourne dans le process de l'API. Rien à installer. Les données sont dans `apps/api/.data/` (ignoré par git), et les migrations sont appliquées au démarrage de l'API. PGlite n'accepte qu'un process à la fois : arrêter `pnpm dev` avant `pnpm db:seed` ou `pnpm db:reset` (le script le vérifie).

**Avec Docker : un vrai PostgreSQL 17.**

```bash
docker compose up -d
```

Puis créer `apps/api/.env` à partir de `apps/api/.env.example` et y décommenter `DATABASE_URL=postgres://joj:joj@localhost:5432/joj`. Relancer `pnpm dev`. Pour revenir à PGlite, recommenter la ligne. Si le port 5432 est déjà pris : `POSTGRES_PORT=5433` dans un fichier `.env` à la racine, et le même port dans `DATABASE_URL`.

Le code ne dépend pas du mode : un seul provider Nest fournit l'instance Drizzle (`src/core/database/`). Les tests utilisent toujours PGlite en mémoire.

**Données de démo** : un fichier `apps/api/data/<table>.json` par table, qui contient un tableau de lignes dont les clés sont les noms des colonnes en base (`created_at`). Un préfixe fixe l'ordre de chargement si une table en référence une autre (`01-pays.json`, `02-athletes.json`). Relancer `db:seed` ignore les lignes déjà présentes.

## Ajouter une fonctionnalité

Dans cet ordre, en écrivant chaque test avant le code et en le voyant échouer. Les titres des tests (`describe`, `it`) s'écrivent en anglais et commencent par l'identifiant du scénario, précédé du numéro de la spec : `it('001-AS2: rejects a full slot', …)`. Modèle : `disciplines`, dont la spec est [`specs/000-disciplines/spec.md`](specs/000-disciplines/spec.md) (`000-AS2:`). Avec Claude Code, la [méthode](#méthode) suit cet ordre pour toi.

1. **Schéma partagé** : `packages/shared/src/<nom>.ts` (schémas Zod d'entrée et de réponse), exporté par `index.ts`.
2. **Entité et son test** : `domain/<entité>.ts`, `domain/<nom>.errors.ts`, `domain/<entité>.spec.ts`.
3. **Cas d'usage et leur test** avec le repository en mémoire : `application/<entité>.repository.ts` (port), `application/testing/in-memory-….ts`, `application/use-cases/*.ts`, `application/<nom>.application.spec.ts`.
4. **Table et migration** : `infra/<nom>.schema.ts`, puis `pnpm db:generate --name=<sujet>`.
5. **Repository Drizzle** : `infra/<entité>.mapper.ts`, `infra/drizzle-….repository.ts` et son test d'intégration `*.int.spec.ts` (PGlite en mémoire).
6. **Controller et test e2e** : `http/<nom>.controller.ts`, `<nom>.module.ts` ajouté aux `imports` de `src/app.module.ts`, puis `test/<nom>.e2e.spec.ts`.
7. **Fausse API** : les routes dans `apps/web/src/mocks/handlers.ts` (mêmes schémas, mêmes codes d'erreur que l'API), leurs données dans `fixture.ts`, et `handlers.test.ts`.
8. **Écran** : dans `apps/web/src/features/<nom>/`, `api/<nom>.api.ts` (appels HTTP), `api/<nom>.queries.ts` (hooks) et leur test, puis `components/` et leurs tests, puis la route dans `apps/web/src/routes/` et son audit `*.a11y.test.tsx`.

## Tests du front

Un test s'appelle `<fichier>.test.tsx` et se place à côté de ce qu'il teste. Il commence par un court commentaire qui dit ce qu'il prouve.

- **Une seule fausse API** (`src/mocks/`), servie par MSW à tous les tests. Une requête qu'elle ne connaît pas fait échouer le test. Elle garde ses données en mémoire : un test les prépare en modifiant `fixture` (`fixture.disciplines = []`). `mockControl` simule une latence (`setLatency(50)`) ou une panne (`failNext('GET /api/disciplines')`, `failPersistently(...)`). Tout est remis à zéro après chaque test.
- **Rendre** (`src/test/utils.tsx`) : `renderRoute({ initialEntries: ['/disciplines'] })` monte l'application à une adresse, comme `main.tsx`. `renderWithProviders(<Composant />)` monte un composant seul, avec Query et un vrai router.
- **Vérifier ce qui part sur le réseau** : `trackRequests()` enregistre méthode, chemin et corps de chaque requête ; `writes(seen)` ne garde que les écritures.
- **Hooks** : `renderHook` avec un `QueryClient`, pour vérifier ce qui est invalidé dans le cache.
- **Accessibilité** : `expect(axeFindings(await runAxe())).toEqual([])` audite toute la page, boîtes de dialogue comprises. Un audit par état de l'écran.

Côté API, les tests s'appellent `*.spec.ts` (unitaires), `*.int.spec.ts` (intégration) et `*.e2e.spec.ts`.

Un composant shadcn de plus : `pnpm dlx shadcn@latest add <composant>` dans `apps/web`.

## Claude Code : hooks et relecteur

Configurés dans `.claude/settings.json`, écrits en Node dans `.claude/hooks/` et testés (`pnpm test`) :

- **Fin de tour (Stop)** : vérifie le format, le lint et les types des seuls fichiers changés. En cas d'échec, Claude reprend la main avec l'erreur. Si l'échec persiste au tour suivant, il est seulement signalé, pour ne pas tourner en boucle. Pour le couper le temps d'une session : `STOP_CHECK=off claude` (sous PowerShell : `$env:STOP_CHECK='off'; claude`).
- **Avant une commande Bash** : refuse un `git commit` dont le message ne suit pas [Conventional Commits](https://www.conventionalcommits.org/fr/) (`feat(api): add disciplines`), ou qui saute la vérification de pré-commit (`--no-verify`, `-n`, `LEFTHOOK=0`), en expliquant pourquoi.
- **Avant une écriture de fichier** : refuse d'écrire un secret probable (clé d'API, token, mot de passe en clair, clé privée). Les vraies valeurs vont dans `apps/api/.env`, ignoré par git.

Le sous-agent **relecteur** (`.claude/agents/relecteur.md`) relit une fonctionnalité dans un contexte vierge. Il ne modifie rien et rend un verdict, preuves à l'appui, selon une grille courte (`relecteur-grille.md`) : chaque scénario a un test, aucune règle métier dans le controller, `domain/` reste pur, les erreurs passent par `AppError`. Dans Claude Code : « relis cette fonctionnalité avec le relecteur ».

Côté git, lefthook lance `pnpm verify --staged` avant chaque commit : format, lint, types et tests liés aux fichiers commités.

## Méthode

Développement guidé par la spec, en cinq commandes Claude Code et trois validations humaines :

```
/prd <idée>     → specs/prd-nom.md : la vision, en tranches TR1, TR2… ── challengée, tu valides → Validé
/spec TRn       → specs/NNN-nom/spec.md (Brouillon) ── tu relis et valides → Validée
/spec-plan      → plan.md : fichiers, erreurs, tests, 6 tâches au plus ── tu valides → Validé
/tdd-task [Tnn] → pour chaque tâche : test rouge → code → vert → un commit
/converge       → traçabilité + pnpm check + relecteur → « Converged » (spec Implémentée)
```

- **`/prd <idée>`** : pour qui, quel problème, quelle solution, et le découpage en tranches ; Claude pose des questions et dit où la vision est faible, sans la remplacer.
- **`/spec TRn`** : le quoi d'une tranche du PRD, sans technique, avec des scénarios `AS1`, `AS2`…
- **`/spec-plan`** : le comment, sur le modèle du module `disciplines`, un test prévu par scénario.
- **`/tdd-task`** : une tâche (`/tdd-task T03`) ou toutes ; `pnpm tdd:red` prouve que le test échoue pour la bonne raison.
- **`/converge`** : si un manque reste, il devient une tâche ; après deux passages, c'est toi qui tranches.

Les règles communes sont dans `specs/constitution.md`. Les scripts `pnpm spec:check`, `tdd:red` et `verify` (`tools/sdd/`) sont les outils des skills ; pour toi, une seule commande : `pnpm check`.

Les hooks (voir ci-dessus) refusent un commit mal nommé ou qui saute `pnpm verify`, et vérifient format, lint et types à chaque fin de tour (`STOP_CHECK=off claude` pour couper ce dernier).

Ces commandes sont une version réduite de [Spec Kit](https://github.com/github/spec-kit) : `/spec` ≈ `/speckit.specify`, `/spec-plan` ≈ `/speckit.plan` + `/speckit.tasks`, `/tdd-task` ≈ `/speckit.implement`, `/converge` ≈ `/speckit.analyze` plus une relecture. Pour passer au cycle complet après la formation (constitution, clarify, checklist), installe la CLI `specify` (Python, via `uv`) et lance `specify init --here --ai claude` dans ton projet.
