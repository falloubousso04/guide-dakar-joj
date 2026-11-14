# 003 — L'agenda de la journée

**Statut** : Implémentée
**PRD** : specs/prd-guide-dakar.md, TR5

## Contexte

Le supporter étranger trouve les animations des Jeux (concerts, fan zones) annoncées un peu partout, sans vue d'ensemble. Pour organiser son temps libre, il veut voir d'un coup tout ce qui se passe un jour donné, dans l'ordre de la journée, et savoir où cela a lieu.

Toutes les dates et heures sont celles de Dakar (UTC+0), sans changement d'heure. Une animation appartient à la journée où elle commence, même si elle finit après minuit.

## User stories

- En tant que supporter étranger, je veux choisir une journée des Jeux et voir toutes ses animations dans l'ordre horaire, afin d'organiser mon temps libre.
- En tant que supporter étranger, je veux connaître le lieu et le quartier de chaque animation, afin de savoir où elle a lieu.

## Scénarios d'acceptation

### AS1 — Les animations d'une journée, triées par heure de début

- **Étant donné** trois animations enregistrées le 8 novembre 2026, commençant à 20 h, 10 h et 15 h · **Quand** le supporter choisit le 8 novembre 2026 dans l'agenda · **Alors** il voit les trois animations dans l'ordre 10 h, 15 h, 20 h, chacune avec son titre, son lieu, son quartier, son heure de début et son heure de fin.

### AS2 — Seules les animations de la journée choisie apparaissent

- **Étant donné** une animation le 7 novembre, une le 8 novembre et une le 9 novembre 2026 · **Quand** le supporter choisit le 8 novembre 2026 · **Alors** seule l'animation du 8 novembre est affichée.

### AS3 — Une journée sans animation affiche une liste vide

- **Étant donné** une journée des Jeux sans aucune animation enregistrée · **Quand** le supporter la choisit · **Alors** la liste est vide, et l'écran lui dit qu'aucune animation n'est prévue ce jour-là.

### AS4 — Le premier et le dernier jour des Jeux sont acceptés

- **Étant donné** une animation le 31 octobre 2026 et une le 13 novembre 2026 · **Quand** le supporter choisit l'une de ces deux journées · **Alors** il voit l'animation de ce jour (les deux bornes font partie des Jeux).

### AS5 — Une journée hors des Jeux est refusée

- **Étant donné** une journée hors des Jeux, le 30 octobre ou le 14 novembre 2026 · **Quand** l'agenda de cette journée est demandé · **Alors** la demande est refusée : refus 422 avec le code AGENDA_DATE_OUTSIDE_GAMES, et aucune animation n'est renvoyée.

### AS6 — Une date illisible est refusée

- **Étant donné** une date qui n'en est pas une (« 2026-13-45 », « demain » ou aucune date) · **Quand** l'agenda de cette date est demandé · **Alors** la demande est refusée : refus 400 avec le code VALIDATION_FAILED, et un message qui dit que la date est invalide.

### AS7 — Le supporter est prévenu quand l'agenda ne peut pas s'afficher

- **Étant donné** une demande d'agenda refusée ou un service qui ne répond pas · **Quand** le supporter choisit une journée · **Alors** l'écran affiche un message d'erreur lisible au lieu d'une liste, et il peut choisir une autre journée.

### AS8 — Animations à heure de début égale

- **Étant donné** deux animations le même jour, toutes deux à 15 h, intitulées « fan zone » et « Concert » · **Quand** l'agenda de ce jour est demandé · **Alors** « Concert » apparaît avant « fan zone » (ordre alphabétique du titre, casse ignorée), et à titre égal l'ordre reste le même d'un affichage à l'autre.

### AS9 — Une animation qui finit après minuit

- **Étant donné** une animation le 8 novembre 2026 de 22 h à 1 h · **Quand** le supporter choisit le 8 novembre, puis le 9 novembre · **Alors** elle apparaît dans l'agenda du 8 novembre et pas dans celui du 9.

## Hors périmètre

- Filtrer par quartier, par lieu ou par type d'animation ; rechercher une animation.
- Ajouter, modifier ou supprimer une animation depuis l'application.
- Relier l'agenda au chatbot ou au temps libre avant l'épreuve (c'est TR3).
- Le lien vers la carte pour une animation (TR4 ne couvre que les lieux du chatbot).

## Questions ouvertes

- Hypothèse : à l'ouverture, l'écran montre la journée du jour si elle est pendant les Jeux, sinon le 31 octobre ; le choix du jour ne propose que les journées des Jeux, donc AS5 concerne surtout un appel direct à l'API.
- Hypothèse : les animations sont des données de démonstration (PRD).
