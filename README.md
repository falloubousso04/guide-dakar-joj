# Guide de Dakar — JOJ Dakar 2026

Projet de groupe de l'atelier C du bootcamp Claude Code, thème **Guide touristique de Dakar**.

## Le problème

Des milliers de visiteurs et de supporters sont à Dakar pour les Jeux, souvent pour la première fois. Entre deux épreuves, ils ont quelques heures devant eux et ne savent pas quoi faire, ni où : les animations sont annoncées un peu partout, et rien ne dit ce qui est proche, ce qui se passe maintenant, ou ce qui vaut le détour.

## Notre produit

Le groupe a retenu le PRD de Fallou Bousso : **[specs/prd-guide-dakar.md](specs/prd-guide-dakar.md)**. C'est le seul PRD du dépôt, et celui que lisent toutes les commandes de la méthode.

**Un chatbot de poche pour les supporters.** Le supporter écrit comme il parlerait à un habitant (« je suis à Diamniadio, mon match est à 17 h ») ; le chatbot lui répond avec les lieux où l'aller, la visite et le retour tiennent avant son épreuve, et lui demande ce qui manque. Claude comprend la phrase et rédige la réponse ; le choix des lieux reste une règle de temps appliquée par l'application.

| Tranche | Ce qu'on livre                                                  | Spec | État    |
| ------- | --------------------------------------------------------------- | ---- | ------- |
| TR1     | Demander au chatbot quoi faire avant son épreuve                | 001  | à faire |
| TR2     | Le chatbot tient compte des envies                              | 002  | à faire |
| TR3     | Ce qui se passe maintenant : les animations en cours ou à venir | 003  | à faire |

**Qui fait quoi** : TR1 est découpée en quatre parties, une par membre, chacune avec ses fichiers, ses contrats et le design de l'écran. Tout est dans **[ORGANISATION.md](ORGANISATION.md)** : lis-le avant de coder.

| Partie | Personne                  | Quoi                                        |
| ------ | ------------------------- | ------------------------------------------- |
| A      | Fallou Bousso             | contrats, puis intégration de l'IA (Claude) |
| B      | `yandeG-dev`              | les lieux et la règle de temps              |
| C      | `taphsirabdoulaye-source` | l'API du chatbot                            |
| D      | `aminousy`                | l'écran de discussion et son design         |

**Avant de commencer TR1**, le PRD est au statut `Brouillon` : le groupe le relit avec la grille, puis Fallou le fait valider avec `/prd`. Personne ne lance `/spec` avant que le statut soit `Validé`.

## Démarrer

1. Clone le dépôt : `git clone https://github.com/falloubousso04/guide-dakar-joj.git`, puis `cd guide-dakar-joj`.
2. `pnpm install`, puis `pnpm exec lefthook install` (installe le hook de pré-commit).
3. `pnpm check` doit être vert.
4. Lance Claude Code à la racine du dépôt : il lit `CLAUDE.md` et les skills tout seul.

## Comment on travaille

Ce dépôt contient la base du bootcamp : l'API, le front, les schémas partagés, les outils `tools/sdd`, les skills, le sous-agent `relecteur`, les hooks et le `CLAUDE.md` du projet. Les règles sont dans `specs/constitution.md`, la grille de relecture dans `task/GRILLE-RELECTURE.md`.

**Une tranche à la fois, dans l'ordre.** Le pilote de la tranche écrit la spec et le plan avec le groupe ; ensuite, chacun réalise sa tâche du plan sur sa propre branche (voir [ORGANISATION.md](ORGANISATION.md)). Pour TR1, le pilote est Fallou.

1. **Spec et plan** : le pilote crée la branche `tr1-spec`, lance `/clear`, `/spec TR1 <précisions>`, puis `/spec-plan` en lui donnant `ORGANISATION.md`. Au moins un autre membre relit `spec.md` puis `plan.md` avec la grille avant chaque « je valide ». La pull request est fusionnée dans `main`.
2. **Contrats** : le pilote réalise T01 (`/tdd-task T01`) et la fusionne dans `main`. Les autres attendent cette fusion.
3. **Code en parallèle** : chacun part de `main` à jour, crée la branche de sa tâche, puis lance `/tdd-task T0n` avec son numéro. Claude écrit chaque test d'abord, le voit échouer, puis fait le commit.
4. **Pull requests** : `pnpm check` vert, push, pull request vers `main`. Un autre membre la relit et la fusionne. Celui qui produit ne valide pas.
5. **Fin** : le pilote lance `/converge` sur `main`, puis la démo avec `pnpm dev`.

**Règles git du groupe**

- On ne pousse jamais directement sur `main` : tout passe par une branche et une pull request relue.
- Messages Conventional Commits : `feat(guide): T03 propose only reachable places (001-AS2)`, `docs(prd): …`. Jamais `--no-verify`.
- `git pull --rebase` avant de pousser ; `pnpm check` vert avant de demander une relecture.
- On ne modifie pas le PRD sans le groupe : une modification passe par `/prd <la modification>`, qui l'amende, et une nouvelle validation.

**Secrets** : la clé de l'API Claude (TR2) va seulement dans `apps/api/.env`, ignoré par git. Chacun utilise sa propre clé ; on ne la colle jamais dans une conversation, un commit ou une issue.

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
