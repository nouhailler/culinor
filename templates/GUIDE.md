# Gabarits — enrichir l'inventaire

Deux gabarits, pour deux couches distinctes de l'inventaire :

- [`gabarit-specialites.json`](gabarit-specialites.json) — **spécialités
  culinaires** (recettes) et **produits du terroir** (fromages, charcuteries
  brutes...). Clé `"fiches"`.
- [`gabarit-appellations.json`](gabarit-appellations.json) — **appellations
  et productions** : AOP/AOC/IGP/Label Rouge, vins, eaux-de-vie, liqueurs,
  productions locales. Clé `"appellations"`.

Duplique celui qui convient, remplis-le pour une région. Deux façons de s'en
servir ensuite :

- **Dans l'application** — bouton ⚙️ *Paramètres* dans l'en-tête. Les boutons
  *Insérer* déposent directement un gabarit vide dans le champ (pas besoin
  d'ouvrir ces fichiers), *Copier* le met dans le presse-papier. Coller ou
  charger un fichier fonctionne aussi ; le type (spécialités/produits ou
  appellations) est détecté automatiquement à la validation. L'ajout reste
  **local à ce navigateur** (`localStorage`) : les autres visiteurs ne le
  voient pas, et il disparaît si le site vide son stockage. Le bouton
  *Copier le code pour data.js* dans la même fenêtre donne le code prêt à
  coller dans le dépôt — c'est l'étape suivante pour le rendre permanent.
- **Par le chat, ou via une autre IA** — transmets le fichier rempli, à moi
  ou à un autre outil (OpenRouter, etc.). Chaque gabarit porte une clé
  `"_instructions"` qui documente tous les champs directement dans le
  fichier — pas besoin de fournir ce guide en plus, le JSON se suffit à
  lui-même. Cette clé est ignorée à l'import, à garder ou supprimer selon
  l'envie. Si c'est moi qui reçois le fichier rempli, je valide et je
  fusionne dans [`src/data.js`](../src/data.js).

Un fichier = une région = autant d'entrées que tu veux dedans.

## `region`

L'identifiant d'une des 13 régions existantes (pas de nouvelle région à créer
ici — l'atlas est fixé aux 13 régions métropolitaines) : `hdf`, `nor`, `idf`,
`ge`, `bre`, `pdl`, `cvl`, `bfc`, `na`, `ara`, `occ`, `paca`, `cor`.

## Spécialités & produits (`gabarit-specialites.json`)

### Niveau 1 ou 2 ?

Cette distinction est la plus importante du gabarit :

- **Niveau 1 — spécialité culinaire** : une recette composée, assemblée à
  partir de plusieurs ingrédients suivant une technique. *Gratin dauphinois,
  cassoulet, tarte Tatin.*
- **Niveau 2 — produit du terroir** : un produit qu'on achète fini, même
  affiné ou transformé par un savoir-faire artisanal — on ne le « cuisine »
  pas, on le sert. *Comté, Roquefort, figatellu.*

Règle pratique : un fromage est presque toujours Niveau 2. Une charcuterie
qui se mange telle quelle (achetée chez le charcutier) est Niveau 2 ; une
charcuterie transformée en plat composé (jambon persillé en terrine) est
Niveau 1. Un plat ou un dessert est presque toujours Niveau 1.

### Chaque fiche

| Champ | Attendu |
| --- | --- |
| `id` | Identifiant unique, minuscules, sans accent ni espace : `cassoulet`, `tartenormande`. Je vérifie qu'il n'existe pas déjà (dans les deux gabarits). |
| `n` | Nom affiché, avec accents et majuscules : `Cassoulet`. |
| `t` | Exactement l'un de : `Fromage`, `Plat`, `Dessert`, `Charcuterie` — détermine la couleur et le filtre. |
| `niveau` | `1` (spécialité culinaire) ou `2` (produit du terroir) — voir ci-dessus. |
| `aop` | Mention officielle si elle existe : `AOP 1976`, `AOC 1925`, `IGP Sud-Ouest` — sinon `—`. |
| `saison` | `Toute l'année`, `Hiver`, `Été`, ou une fenêtre précise : `Octobre-mai`, `Août-septembre`. |
| `temps` | Temps de préparation avant cuisson : `30 min`, `45 min + 12 h`. Pour un fromage/charcuterie affiné(e), en général `—`. |
| `cuisson` | Durée de cuisson : `45 min`, `3 h`. Pour un affinage : `Affinage 5 sem.`, `Affinage 3 mois`. |
| `diff` | Exactement l'un de : `Simple`, `Technique`, `Expert`, `Affinage` (ce dernier pour ce qui ne se cuisine pas — fromages, charcuteries). |
| `portions` | `6 personnes`, `8 parts`, ou pour un produit vendu en pièce : `Meule 40 kg`, `Cylindre 1,9 kg`. |
| `teaser` | Une phrase d'accroche (15-20 mots) — sert sur les cartes et en « Fiche du jour ». |
| `hist` | 3 à 5 phrases : origine, méthode, ce qui la protège ou la distingue, un repère chiffré si possible. |
| `ing` | Liste `{nom, qte}`, 4 à 8 lignes. |
| `etapes` | 3 à 5 étapes à l'impératif, une phrase chacune. |
| `accords` | Exactement 2 `{vin, note}` — la `note` justifie l'accord en une phrase. |
| `sourcing` | Une phrase de conseil d'achat professionnel (où/quoi choisir, quoi éviter). |
| `allergenes` | Liste séparée par des virgules : `Gluten, lait, œuf` — ou `—` si aucun. |
| `cout` | Coût matière estimé : `3,10 € / part`, `4,30 € / pièce`, `6,10 € / couvert`. |

## Appellations & productions (`gabarit-appellations.json`)

Le Niveau 3 : pas de recette, pas d'ingrédients — un statut ou une
production à décrire (AOP/AOC/IGP/Label Rouge, vin, eau-de-vie, liqueur,
production locale). Sa fiche n'a ni étapes de préparation ni portions.

| Champ | Attendu |
| --- | --- |
| `id` | Identifiant unique — mêmes règles que ci-dessus, même espace de noms (pas de doublon avec une spécialité/un produit). |
| `n` | Nom affiché : `Sancerre`, `Chartreuse verte`. |
| `categorie` | Exactement l'une de : `AOP`, `AOC`, `IGP`, `Label Rouge`, `Vin`, `Eau-de-vie`, `Liqueur`, `Production locale`. |
| `depuis` | Date ou année de reconnaissance officielle : `AOC 1936`. `—` si non pertinent. |
| `aire` | Zone géographique de production. |
| `teaser` | Une phrase d'accroche (15-20 mots). |
| `hist` | 3 à 5 phrases : origine, cadre réglementaire, ce qui la distingue. |
| `caracteristiques` | Notes de production ou de dégustation — remplace ingrédients/étapes. |
| `accords` | `{avec, note}` — plats ou moments qui l'accompagnent ; `avec` peut être un plat plutôt qu'un vin. |
| `sourcing` | Une phrase de conseil d'achat ou de vérification d'authenticité. |
| `allergenes` | Ex. `Sulfites` pour un vin — ou `—`. |
| `cout` | Coût indicatif : `28 € / bouteille`, `4 € / verre`. |

Je n'invente aucun contenu Niveau 3 sans données fournies — aucune fabrication
de faits (fausse date d'appellation, fausse aire, faux cépage).

## Ce que je fais à la réception

1. Je détecte le type de gabarit (`"fiches"` ou `"appellations"`), je vérifie
   que chaque `id` est unique dans tout l'inventaire (les deux niveaux
   confondus), et que `region`/`t`/`niveau`/`diff`/`categorie` respectent les
   valeurs ci-dessus.
2. Je convertis le JSON dans la syntaxe de `SPECS` ou `APPELLATIONS`
   (`src/data.js`) et je l'ajoute à la suite du tableau concerné.
3. Je relance le serveur local pour vérifier l'affichage (atlas, région,
   fiche) avant de te confirmer.

Pas besoin de toucher `assets/` ni `src/app.js` — tout le rendu (couleurs,
filtres, mise en page) suit automatiquement le `t`/`niveau` de chaque fiche,
ou la présence d'appellations pour la région.
