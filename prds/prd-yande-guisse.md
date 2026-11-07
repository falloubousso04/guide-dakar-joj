# PRD — Guide Dakar

**Statut** : Brouillon

## Problème

Un visiteur aux JOJ Dakar 2026 a quelques heures libres entre deux épreuves. Il ne connaît pas Dakar, ignore ce qui se passe près de lui à cet instant, et ne sait pas distinguer ce qui vaut le déplacement. Il repart sans avoir profité de la ville.

## Utilisateurs

- **Visiteur aux JOJ (local ou étranger)** : il veut savoir quoi faire maintenant, près de lui, sans chercher.
- **Organisateur** : il veut publier une animation pour qu'elle soit visible des visiteurs pendant les Jeux.

## Proposition

Une page qui répond à trois questions : qu'est-ce qui se passe _maintenant_ ? Qu'est-ce qui est _proche_ ? Qu'est-ce qui _vaut le détour_ ? Les organisateurs alimentent le contenu ; les visiteurs filtrent par heure et par quartier, et un signal "coup de cœur" les aide à choisir.

## Mesure du succès

Lors de la démo : un visiteur entre 14 h 30 et son quartier, voit les animations en cours dans cette zone ; une animation "coup de cœur" apparaît en tête.

## Tranches

### TR1 — Ce qui se passe maintenant

Le visiteur entre une heure et voit les animations en cours, triées par heure de début. Règle : `début ≤ heure < fin`.

### TR2 — Agenda du jour avec lieu

Le visiteur choisit une date et voit toutes les animations de la journée, triées par heure de début, avec quartier et lieu.

### TR3 — Proposer une animation

Un organisateur ajoute une animation (titre, lieu, quartier, début, fin). Règles : fin après début ; dates dans les Jeux (31 oct. – 13 nov. 2026).

### TR4 — Ce qui est proche

Le visiteur filtre par quartier. Seules les animations de ce quartier s'affichent, dans l'ordre chronologique.

### TR5 — Ce qui vaut le détour

Un organisateur marque une animation "coup de cœur". Ces animations apparaissent en tête de liste.

## Hors périmètre

- Géolocalisation automatique, notation par les visiteurs, réservation, authentification.

## Hypothèses et risques

- Les noms de quartiers doivent être cohérents entre organisateurs (sinon TR4 est inutilisable) ; sans animations saisies avant la démo, la page reste vide.
