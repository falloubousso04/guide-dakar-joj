# Guide de Dakar — JOJ Dakar 2026

Projet de groupe de l'atelier C du bootcamp Claude Code, thème **Guide touristique de Dakar**.

## Le problème

Des milliers de visiteurs et de supporters sont à Dakar pour les Jeux, souvent pour la première fois. Entre deux épreuves, ils ont quelques heures devant eux et ne savent pas quoi faire, ni où : les animations sont annoncées un peu partout, et rien ne dit ce qui est proche, ce qui se passe maintenant, ou ce qui vaut le détour.

## Où en est le projet

Chaque membre du groupe a écrit sa propre proposition de PRD (Product Requirements Document : la vision du produit sur une page, découpée en tranches). Ce dépôt les rassemble pour :

1. les comparer ;
2. choisir la meilleure, ou les combiner ;
3. obtenir **un PRD commun**, sur lequel le groupe construit l'application.

## Les propositions

| Fichier | Auteur |
| --- | --- |
| [prds/fallou.md](prds/fallou.md) | Fallou |

## Ajouter ta proposition

1. Accepte l'invitation au dépôt, puis clone-le : `git clone https://github.com/falloubousso04/guide-dakar-joj.git`.
2. Copie ton PRD dans `prds/<ton-prenom>.md` (en minuscules, sans accent).
3. Ajoute une ligne pour toi dans le tableau ci-dessus.
4. Commite et pousse : `git add prds README.md`, `git commit -m "docs(prd): add <prenom> proposal"`, puis `git pull --rebase` et `git push`.

Ne modifie pas le PRD d'un autre membre : les remarques se font en discussion, ou dans une issue.

## Comparer les propositions

Pour chaque PRD, réponds aux cinq questions de la grille de relecture du bootcamp. Une seule réponse « non » suffit pour écarter une proposition ou la corriger :

1. **Le problème est celui de quelqu'un de précis** : on sait qui souffre, de quoi, et comment il fait aujourd'hui.
2. **La proposition répond à ce problème-là**, et dit pourquoi elle plutôt qu'une autre ; pourquoi de l'IA, si elle en utilise.
3. **Le succès se constate pendant la démo** : une action réussie, un chiffre, un refus.
4. **La tranche 1 tient en 2 heures de code** : une ou deux règles métier, une action principale, et elle a de la valeur seule.
5. **Le hors périmètre et les hypothèses sont écrits.**

Le PRD commun retenu sera placé dans `prd-commun.md`, à la racine.
