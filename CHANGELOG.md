# Changelog

Historique des ajouts à l'inventaire et à l'application. Format libre,
groupé par date ; le détail fiche par fiche reste dans l'historique Git
(`git log`). Voir [CONTEXT.md](CONTEXT.md) pour l'état courant de
l'inventaire.

## 2026-09-12

### Île-de-France
- **3e paquet** (10 fiches) : Niflette de Provins, Sucre d'orge des
  religieuses de Moret, Coquelicot de Nemours, Pâté de Houdan, Gratinée des
  Halles, Entrecôte Bercy, Escalope parisienne, Salade parisienne, Fricassée
  de poulet de Houdan, Macaron fondant de Réau. Île-de-France : 11 → 21.
- **2e paquet, nouvelle région** (10 fiches) : Brie de Melun, Coulommiers,
  Fontainebleau, Potage Saint-Germain, Bœuf miroton, Croque-monsieur,
  Paris-Brest, Saint-Honoré, Tarte Bourdaloue, Brioche de Nanterre.
  Île-de-France : 1 → 11.

### Normandie
- **4e paquet** (10 fiches) : Pommes à la grivette, Croûtes normandes,
  Soufflé normand, Cochelin d'Évreux, Sablé de l'Abbaye, Becs de Flers,
  Brioche moulinoise, Brasillé de Clinchamps-sur-Orne, Gâteau fouetté de
  Saint-Lô, Macarons de Bellême. Normandie : 22 → 32.
- **3e paquet** (10 fiches) : Canard à la rouennaise, Poulet et Omelette
  vallée d'Auge, Demoiselles de Cherbourg, Mirliton de Rouen, Mirliton de
  Pont-Audemer, Caramels d'Isigny, Brioche du Vast, Sablés d'Asnelles,
  Saucisson du Marin. Normandie : 12 → 22.
- **2e paquet, nouvelle région** (10 fiches) : Livarot, Pont-l'Évêque,
  Neufchâtel, Andouille de Vire, Boudin noir de Mortagne, Tripes à la mode
  de Caen, Marmite dieppoise, Teurgoule, Bourdelot normand, Fallue.
  Normandie : 2 → 12.

### Hauts-de-France
- **5e paquet** (10 fiches). Hauts-de-France : 30 → 40.
- **4e paquet** (10 fiches) — introduction de la région **« France
  entière »** (`national`), catégorie sans médaillon sur la carte pour les
  classiques sans ancrage régional exclusif (ex. Palet de dames).
- **3e paquet** (9 fiches).

## 2026-09-11

### Hauts-de-France
- **2e paquet, nouvelle région** (10 fiches) : Ficelle picarde, Welsh,
  Potjevleesch, Waterzoï de poulet, Chicons au gratin, Gâteau battu, Tarte
  au libouli, Macaron d'Amiens, Bêtise de Cambrai, Lucullus de Valenciennes.

### Auvergne-Rhône-Alpes
- 14 paquets successifs (4 fiches initiales puis 13 paquets
  supplémentaires) : ARA passe de 4 à 88 fiches. Point notable : le
  **6e paquet** introduit le type **`Boisson`** (vin chaud savoyard), absent
  du schéma d'origine.

### Infrastructure
- **Gabarits auto-documentés** — `templates/gabarit-specialites.json`,
  `templates/gabarit-appellations.json` et `templates/GUIDE.md`, pour
  remplir des paquets de fiches sans guide externe (clé `_instructions`
  intégrée au JSON).
- **Paramètres d'import, polish visuel, et trois niveaux de patrimoine** —
  import de gabarit en local (`localStorage`) depuis l'application, et
  introduction du niveau 3 (`APPELLATIONS`) pour les AOP/AOC/IGP et
  productions, en plus des niveaux 1 (spécialité culinaire) et 2 (produit du
  terroir).

## 2026-09-03

- **Version initiale** — implémentation de la maquette Claude Design
  « Terroir de France » : atlas du patrimoine culinaire, 13 régions
  métropolitaines, 31 fiches reprises intégralement de la maquette.
