# PRD — Guide de Dakar entre deux épreuves

**Auteur** : Fallou Bousso

**Statut** : Brouillon

## Problème

Des supporters étrangers, à Dakar pour la première fois, ont quelques heures libres entre deux épreuves. Les lieux et les animations sont annoncés un peu partout, et rien ne leur dit ce qu'ils peuvent voir tout en revenant à temps pour leur prochaine épreuve. Faute de réponse, ils restent près du site, ou partent trop loin et ratent l'épreuve.

## Utilisateurs

- Supporter étranger seul, qui ne connaît ni la ville ni les distances : savoir quoi visiter pendant son temps libre sans rater sa prochaine épreuve.

## Proposition

Le supporter indique le site olympique où il se trouve et l'heure de sa prochaine épreuve. L'application lui propose seulement les lieux où le trajet aller, la durée de visite et le trajet retour tiennent avant cette heure. Chaque lieu connaît son temps de trajet depuis chaque site olympique. Une règle de temps appliquée par l'application répond à la vraie peur du supporter, rater son épreuve, mieux qu'une liste de lieux qu'il devrait trier lui-même.

## Mesure du succès

Pendant la démo, un supporter libre de 11 h 30 à 17 h depuis un site reçoit seulement des lieux qui le ramènent avant 17 h, et un lieu trop loin n'est pas proposé.

## Tranches

### TR1 — Les lieux faisables dans le temps libre

Le supporter donne son site olympique et l'heure de fin de son temps libre ; il obtient les lieux qu'il peut visiter. Règle : un lieu n'est proposé que si trajet aller, durée de visite et trajet retour tiennent avant l'heure de fin.

### TR2 — Une demande en langage courant

Le supporter écrit sa demande comme il la dirait (« j'ai 3 h, j'aime la musique ») ; Claude en tire le site, l'heure et ses envies, et l'application propose les lieux faisables qui y correspondent. L'IA sert seulement à comprendre une phrase libre : les règles de temps restent appliquées par l'application.

### TR3 — Ce qui se passe maintenant

Les animations datées (concerts, fan zones) s'ajoutent aux lieux. Règle : une animation n'est proposée que si elle est en cours ou à venir pendant le temps libre, et que le supporter peut revenir à temps.

## Hors périmètre

- La réservation et le paiement.
- La carte et l'itinéraire pas à pas, y compris un service de cartes externe.
- Les comptes des visiteurs.
- Les langues autres que le français.

## Hypothèses et risques

- Supposé : le temps libre commence au moment de la demande ; si le supporter doit pouvoir planifier à l'avance, TR1 prend aussi une heure de début.
- Supposé : les temps de trajet enregistrés sont fixes ; un jour d'embouteillage ou de route fermée, un lieu proposé peut faire rater l'épreuve.
- Supposé : aucune marge de sécurité n'est ajoutée au retour ; un supporter qui arrive pile à l'heure peut manquer l'entrée du site.
- Supposé : les horaires d'ouverture des lieux ne sont pas vérifiés en TR1 ; un lieu fermé peut être proposé.
- Supposé : les lieux sont des données de démonstration ; leur exactitude n'est pas garantie.
