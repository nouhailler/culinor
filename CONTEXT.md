# Contexte du projet

Ce document décrit l'état de l'inventaire et la méthode de travail, pour
quiconque (humain ou IA) reprend le projet sans avoir suivi son historique.
Pour l'architecture technique du site, voir [README.md](README.md).

## Ce qu'est le projet

« Terroir de France » est un atlas statique du patrimoine culinaire français :
fromages, plats, desserts, charcuteries et boissons, classés par région, avec
pour chacun une fiche détaillée (histoire, ingrédients, préparation, accords
mets & vins, repères professionnels d'achat).

Il n'y a pas de backend ni de base de données : tout l'inventaire vit dans
[`src/data.js`](src/data.js), un fichier JS statique exporté et lu directement
par le site.

## Modèle de données

- **Régions** (`REGIONS`) — 14 entrées : les 13 régions administratives
  métropolitaines, plus `national` (« France entière »), une catégorie sans
  médaillon sur la carte réservée aux classiques dont l'identité dépasse un
  terroir précis (ex. le palet de dames). À utiliser avec parcimonie : la
  plupart des spécialités ont une vraie région d'origine.
- **Fiches** (`SPECS`) — chaque fiche a un `niveau` :
  - **1 — spécialité culinaire** : une recette composée (cassoulet, tarte
    Tatin).
  - **2 — produit du terroir** : acheté fini, même affiné ou transformé
    (comté, roquefort, figatellu).
  - **3 — appellation** (`APPELLATIONS`, schéma séparé, actuellement vide) :
    un statut ou une production (AOP/AOC/IGP, vin, eau-de-vie), sans recette.
- **Type** (`t`) — orthogonal au niveau : `Fromage`, `Plat`, `Dessert`,
  `Charcuterie`, `Boisson` (ce dernier ajouté en cours de route, une
  soumission ne rentrant dans aucun des quatre types d'origine).

## État actuel de l'inventaire

**205 fiches** sur **14 régions** (au 2026-09-12) :

| Région | Fiches |
| --- | --- |
| Auvergne-Rhône-Alpes | 88 |
| Hauts-de-France | 40 |
| Normandie | 32 |
| Île-de-France | 21 |
| Grand Est | 3 |
| Bretagne | 3 |
| Bourgogne-Franche-Comté | 3 |
| Nouvelle-Aquitaine | 3 |
| Occitanie | 3 |
| Provence-Alpes-Côte d'Azur | 3 |
| Centre-Val de Loire | 2 |
| Corse | 2 |
| Pays de la Loire | 1 |
| France entière | 1 |

Par type : Plat 76 · Dessert 73 · Fromage 30 · Charcuterie 24 · Boisson 2.
`APPELLATIONS` (niveau 3) est vide — aucune fiche appellation n'a encore été
soumise ; le gabarit existe (`templates/gabarit-appellations.json`) mais reste
inutilisé.

Les régions à un ou deux chiffres (Bretagne, Grand Est, Pays de la Loire...)
n'ont reçu qu'un ou deux paquets de départ ; elles sont ouvertes à
l'enrichissement au même titre que les autres.

## Workflow d'ajout de contenu

Le contenu arrive par « paquets » : un lot de fiches au format JSON, rempli
par l'utilisateur ou un outil externe (OpenRouter, etc.) à partir des gabarits
de `templates/` (voir `templates/GUIDE.md`, qui documente aussi le détail des
champs et la distinction niveau 1 / niveau 2).

À chaque paquet reçu :

1. **Vérifier les doublons** — comparer chaque `id`/nom du paquet à
   l'ensemble des fiches existantes, toutes régions confondues (pas
   seulement la région ciblée : un même plat peut être resoumis ailleurs,
   ex. la soupe à l'oignon proposée à la fois pour l'ARA et pour l'IDF).
2. **Vérifier la vraisemblance** — dates d'AOP/AOC/IGP, attributions
   régionales, figures historiques citées. Ne jamais inventer un fait ; une
   information non vérifiable est signalée à l'utilisateur plutôt
   qu'affirmée.
3. **Poser la question plutôt que trancher seul** — dès qu'un point est
   douteux (doublon de sujet, historique trop vague, région suspecte), le
   signaler via une question à choix (option « Recommandé » + alternatives)
   et appliquer la décision de l'utilisateur au mot près. L'utilisateur
   répond parfois par un texte libre et bien documenté plutôt qu'en
   choisissant une option : dans ce cas, ce texte fait autorité et sert à
   enrichir ou corriger la fiche (voir par ex. Brioche moulinoise, Brasillé
   de Clinchamps, Macarons de Bellême, Gratinée des Halles, Escalope
   parisienne — toutes réécrites sur la base de précisions apportées après
   coup).
4. **Normaliser le format** — guillemets courbes → droits, coût en
   `€`/`€€`/`€€€` ou en mots (« Moyen », « Faible »...) converti en valeur
   concrète cohérente avec l'échelle déjà en base (`X,XX € / part`,
   `/ pièce`, `/ kg`, `/ 100 g`...), `id` en minuscules sans accent ni
   séparateur.
5. **Intégrer dans `src/data.js`** — un script Python (heredoc via Bash) qui
   ancre l'insertion sur la dernière ligne exacte de l'entrée précédente,
   avec un `assert content.count(anchor) == 1` avant remplacement ; l'outil
   Edit s'est montré peu fiable sur ces gros blocs multi-lignes.
6. **Tester en direct** — `node --check src/data.js`, puis navigation
   navigateur (`fetch(url, {cache:'reload'})` + `navigate(..., force:true)`
   pour forcer le rechargement du module ES, sinon le cache sert l'ancienne
   version), vérifier l'absence d'erreur console, le décompte de la région et
   le rendu d'au moins une fiche.
7. **Commit + push** — un commit par paquet, message en français résumant
   les fiches ajoutées et les décisions prises, `Co-Authored-By: Claude
   Opus 5 <noreply@anthropic.com>`.

## Décisions structurantes prises en cours de route

- **Type `Boisson`** ajouté (à `COL`, `TYPES`, `KNOWN_TYPES`, les gabarits et
  `GUIDE.md`) quand une soumission (vin chaud savoyard) ne correspondait à
  aucun des quatre types d'origine.
- **Région `national` (« France entière »)** créée pour les classiques sans
  ancrage régional exclusif (ex. palet de dames), plutôt que de les exclure
  ou de leur inventer une région. Sans médaillon sur la carte (`PIN` n'a pas
  d'entrée pour `national` ; le rendu gère déjà l'absence de pin), mais avec
  sa page et sa place dans la liste des régions.
- Des cousinages régionaux authentiques sont conservés comme fiches
  distinctes (truffade/aligot, tartiflette/raclette, rabotte/pomme riboche) ;
  un même plat resoumis sous un autre nom ou pour une autre région est
  fusionné ou exclu selon le cas (voir Gratinée des Halles/Soupe à l'oignon
  ci-dessus pour un exemple de recentrage plutôt que d'exclusion pure).
