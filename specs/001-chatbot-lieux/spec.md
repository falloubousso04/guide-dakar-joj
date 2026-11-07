# 001 — Demander au chatbot quoi faire avant son épreuve

**Statut** : Validée
**PRD** : specs/prd-guide-dakar.md, TR1

## Contexte

Un supporter étranger a quelques heures libres entre deux épreuves et ne connaît ni la ville ni les distances. Il écrit au chatbot comme il parlerait à un habitant ; le chatbot lui répond avec les lieux qu'il peut visiter tout en revenant à temps. C'est la première tranche : sans elle, le produit n'existe pas.

## User stories

- En tant que supporter étranger, je veux écrire au chatbot où je suis et quand est mon épreuve, afin de savoir quels lieux je peux visiter sans la rater.
- En tant que supporter étranger, je veux que le chatbot me demande ce que j'ai oublié de dire, afin de ne pas avoir à deviner ce qu'il attend.

## Scénarios d'acceptation

### AS1 — Proposer les lieux faisables

- **Étant donné** des lieux enregistrés avec leur durée de visite et leur temps de trajet depuis Diamniadio · **Quand** le supporter écrit « je suis à Diamniadio, il est 11 h 30, mon match est à 17 h » · **Alors** le chatbot répond par un texte et une liste de lieux, chacun avec son nom, son quartier, sa durée de visite, son temps de trajet et son heure de retour au site, triés par heure de retour la plus tôt.

### AS2 — Un lieu trop loin n'est pas proposé

- **Étant donné** un lieu dont aller, visite et retour depuis Diamniadio font 6 h · **Quand** le supporter libre de 11 h 30 à 17 h envoie son message · **Alors** ce lieu n'apparaît pas dans la liste.

### AS3 — Revenir pile à l'heure est accepté

- **Étant donné** un lieu dont aller, visite et retour font exactement 5 h 30 · **Quand** le supporter libre de 11 h 30 à 17 h envoie son message · **Alors** ce lieu est proposé, avec un retour à 17 h 00.

### AS4 — Le site ou l'heure de l'épreuve manque

- **Étant donné** un message qui ne cite pas l'heure de l'épreuve, ou aucun site parmi Dakar, Diamniadio et Saly · **Quand** le supporter l'envoie · **Alors** le chatbot lui demande ce qui manque (pour le site, en citant les trois), et ne propose aucun lieu.

### AS5 — Compléter en répondant au chatbot

- **Étant donné** que le chatbot a demandé l'heure de l'épreuve · **Quand** le supporter répond « 17 h » · **Alors** le chatbot tient compte de toute la conversation et propose les lieux faisables depuis le site donné plus tôt.

### AS6 — Sans l'heure qu'il est, le temps libre commence maintenant

- **Étant donné** un message qui donne le site et l'heure de l'épreuve, mais pas l'heure qu'il est · **Quand** le supporter l'envoie · **Alors** les lieux sont choisis à partir de l'heure d'envoi du message.

### AS7 — Aucun lieu ne tient

- **Étant donné** une épreuve dans 20 minutes · **Quand** le supporter envoie son message · **Alors** la liste est vide, et le chatbot dit qu'aucun lieu ne tient avant l'épreuve.

### AS8 — Heure de l'épreuve déjà passée

- **Étant donné** qu'il est 11 h 30 · **Quand** le supporter écrit que son épreuve était à 10 h · **Alors** refus 422 avec le code EVENT_TIME_PASSED, et l'écran dit que l'heure de l'épreuve est déjà passée.

### AS9 — L'IA est indisponible

- **Étant donné** que l'IA ne répond pas · **Quand** le supporter envoie un message · **Alors** refus 503 avec le code ASSISTANT_UNAVAILABLE, et l'écran dit que le chatbot n'a pas pu répondre, sans proposer de lieu.

### AS10 — L'écran de discussion

- **Étant donné** l'écran du chatbot · **Quand** le supporter envoie un message · **Alors** son message s'affiche, un indicateur dit que le chatbot écrit, puis la réponse s'affiche avec une carte par lieu proposé.

### AS11 — Message vide

- **Étant donné** une zone de saisie vide ou faite d'espaces · **Quand** le supporter essaie d'envoyer · **Alors** rien n'est envoyé et aucun message ne s'ajoute à la conversation.

## Hors périmètre

- Les envies du supporter (TR2) et les animations datées (TR3).
- Les horaires d'ouverture des lieux, et une marge de sécurité au retour.
- L'ajout ou la modification de lieux depuis l'application : les lieux sont des données de démonstration.

## Questions ouvertes

- Une heure d'épreuve plus tôt que l'heure actuelle est-elle pour le lendemain ? Hypothèse : non, l'épreuve est le jour même (heure de Dakar), donc AS8 s'applique.
