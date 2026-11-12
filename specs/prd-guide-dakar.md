# PRD — Guide de Dakar entre deux épreuves

**Auteur** : Fallou Bousso
**Statut** : Validé

## Problème

Des supporters étrangers, à Dakar pour la première fois, ont quelques heures libres entre deux épreuves. Les lieux et les animations sont annoncés un peu partout, et rien ne leur dit ce qu'ils peuvent voir tout en revenant à temps pour leur prochaine épreuve. Faute de réponse, ils restent près du site, ou partent trop loin et ratent l'épreuve.

## Utilisateurs

- Supporter étranger seul, qui ne connaît ni la ville ni les distances : savoir quoi visiter pendant son temps libre sans rater sa prochaine épreuve.

## Proposition

Un **chatbot** de poche : le supporter lui écrit comme il parlerait à un habitant (« je suis à Diamniadio, mon match est à 17 h, j'ai envie de musique ») et le chatbot lui répond avec les lieux où l'aller, la visite et le retour tiennent avant son épreuve. S'il manque le site ou l'heure, le chatbot les lui demande. Une conversation convient mieux qu'un formulaire à quelqu'un qui ne connaît ni les noms des lieux ni les quartiers. L'IA comprend la phrase et rédige la réponse ; le choix des lieux reste une règle de temps appliquée par l'application, pour que le chatbot ne propose jamais un lieu qui fait rater l'épreuve.

## Mesure du succès

Pendant la démo, le supporter écrit « je suis à Diamniadio, il est 11 h 30, mon match est à 17 h » : le chatbot propose seulement des lieux qui le ramènent avant 17 h, et un lieu trop loin n'apparaît pas. S'il n'écrit pas l'heure de son match, le chatbot la lui demande.

## Tranches

### TR1 — Demander au chatbot quoi faire avant son épreuve

Le supporter discute avec le chatbot dans l'application web. Le chatbot comprend le site et l'heure de l'épreuve, demande ce qui manque, puis répond avec les lieux faisables. Règle : un lieu n'est proposé que si trajet aller, durée de visite et trajet retour tiennent avant l'heure de l'épreuve.

### TR2 — Le chatbot tient compte des envies

Le supporter dit ce qu'il aime (musique, culture, plage, artisanat) ; le chatbot propose d'abord les lieux faisables qui y correspondent, et le dit quand aucun ne correspond.

### TR3 — Ce qui se passe maintenant

Le chatbot propose aussi les animations datées (concerts, fan zones). Règle : une animation n'est proposée que si elle est en cours ou à venir pendant le temps libre, et que le supporter peut revenir à temps.

### TR4 — Voir le lieu sur la carte

Chaque lieu proposé donne son emplacement : un lien ouvre l'application de cartes du téléphone sur ce lieu, pour que le supporter sache où aller. Règle : un lieu sans emplacement connu n'affiche pas de lien.

### TR5 — L'agenda de la journée

Le supporter consulte toutes les animations d'une journée des Jeux, triées par heure de début, avec leur lieu et leur quartier. Règle : seules les animations de la journée choisie apparaissent, et la journée doit être pendant les Jeux.

## Hors périmètre

- La réservation et le paiement ; une carte intégrée à l'application et l'itinéraire pas à pas ; les comptes des visiteurs et la mémoire d'une conversation ; les langues autres que le français.

## Hypothèses et risques

- Supposé : sans heure donnée, le temps libre commence au message ; les trajets sont fixes, sans marge au retour ni vérification des horaires d'ouverture ; un embouteillage ou un lieu fermé peut gâcher la sortie. Supposé : lieux, emplacements et animations sont des données de démonstration. Risque : si l'IA est indisponible ou comprend mal, le chatbot doit le dire plutôt qu'inventer.
