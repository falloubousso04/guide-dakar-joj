# 002 — Voir le lieu sur la carte

**Statut** : Validée
**PRD** : specs/prd-guide-dakar.md, TR4

## Contexte

Le chatbot propose des lieux dont le supporter étranger ne connaît ni le nom ni le quartier. Il sait qu'il peut y aller avant son épreuve, mais pas où c'est. Il lui faut un moyen d'y aller, sans quitter sa conversation.

## User stories

- En tant que supporter étranger, je veux voir où se trouve un lieu proposé par le chatbot, afin de savoir où aller.
- En tant que supporter étranger, je veux ouvrir ce lieu dans l'application de cartes de mon téléphone, afin de m'y rendre avec l'outil que je connais.

## Scénarios d'acceptation

### AS1 — Un lieu proposé donne son emplacement

- **Étant donné** un lieu enregistré avec son emplacement (une latitude et une longitude), proposé par le chatbot · **Quand** le supporter reçoit la liste des lieux · **Alors** ce lieu est accompagné de son emplacement, tel qu'il est enregistré.

### AS2 — Un lien « Voir sur la carte » ouvre le lieu

- **Étant donné** une carte de lieu dont l'emplacement est connu · **Quand** le supporter choisit « Voir sur la carte » · **Alors** l'application de cartes de son téléphone s'ouvre dans un nouvel onglet, sur l'emplacement exact de ce lieu, et la conversation reste ouverte.

### AS3 — Un lieu sans emplacement n'a pas de lien

- **Étant donné** un lieu proposé dont l'emplacement n'est pas connu · **Quand** le supporter voit sa carte · **Alors** aucun lien « Voir sur la carte » n'est affiché pour lui, et son nom, son quartier, sa durée de visite et son temps de trajet restent affichés.

### AS4 — L'emplacement ne change pas les lieux proposés

- **Étant donné** deux lieux faisables avant l'épreuve, l'un avec un emplacement connu et l'autre sans · **Quand** le supporter envoie son message · **Alors** les deux lieux sont proposés, dans le même ordre que sans emplacement (heure de retour la plus tôt d'abord).

## Hors périmètre

- Une carte intégrée à l'application, et l'itinéraire pas à pas (PRD).
- Demander ou utiliser la position du supporter.
- Ajouter ou modifier l'emplacement d'un lieu depuis l'application.

## Questions ouvertes

- Hypothèse : tous les lieux de démonstration reçoivent un emplacement ; AS3 vaut pour un lieu ajouté plus tard sans emplacement.
- Hypothèse : les emplacements sont des données de démonstration (PRD) ; leur exactitude n'est pas vérifiée.
- Hypothèse : le lien s'ouvre dans un nouvel onglet pour garder la conversation ; l'application de cartes utilisée dépend du téléphone du supporter.
