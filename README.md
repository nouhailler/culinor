# Terroir de France

Inventaire du patrimoine culinaire français : un atlas des treize régions
métropolitaines et **31 fiches** — fromages, plats, desserts et charcuteries —
avec histoire, ingrédients, préparation, accords mets & vins et repères
professionnels.

Implémentation de la maquette Claude Design
[`Terroir de France.dc.html`](design/) (projet `6267fd19-0b0f-4524-8e22-5a55a10f144e`),
habillée par le design system **Classical**.

## Lancer

Aucune étape de build : le site est du HTML, du CSS et des modules ES natifs.
Il faut simplement le servir en HTTP (les modules ES ne se chargent pas depuis `file://`).

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

Déploiement : n'importe quel hébergeur statique. Sur Vercel, `vercel deploy`
depuis la racine suffit — il n'y a ni build, ni fonction serveur, ni variable
d'environnement.

## Structure

```
index.html                  Coque : en-tête collant, champ de recherche, pied de page
assets/design-system.css    Design system Classical (tokens + composants), repris tel quel
assets/app.css              Couche applicative : les styles inline de la maquette, nommés
assets/theme-dark.css       Couche sombre : redéfinit les tokens, pas les composants
src/data.js                 REGIONS · SPECS · TEASERS · COL · FAM — données reprises verbatim
src/app.js                  État, routage par hash et rendu des quatre vues
design/                     La maquette d'origine et son runtime, pour référence
```

## Les quatre vues

| Vue | Adresse | Contenu |
| --- | --- | --- |
| Atlas | `#/` | Carte de France, médaillons cliquables, filtre par type, fiche du jour, liste des régions |
| Région | `#/region/<id>` | Description en deux colonnes justifiées, repères, spécialités inventoriées |
| Fiche | `#/fiche/<id>` | Histoire, préparation numérotée, ingrédients, accords, bloc professionnel, galerie |
| Recherche | `#/?q=<terme>` | Recouvre les autres vues tant que le champ est rempli |

La recherche porte sur le nom, la région, le type, l'accroche et les
ingrédients. Le filtre par type se conserve dans l'adresse (`?type=Fromage`)
et ne restreint que les décomptes de l'atlas — une page région montre toujours
l'intégralité de ses fiches, comme dans la maquette.

## Thème clair / sombre

Classical est un système mono-thème, sur fond clair. Plutôt que de le modifier
— il doit rester synchronisable avec le projet Design — `assets/theme-dark.css`
ne redéfinit que ses **tokens** : rampes, ombres, teintes de produits et de
régions. Aucune classe de composant n'est touchée.

Les rampes neutre et accent sont inversées en valeur mais gardent leur rôle :
`-100` reste « le fond teinté », `-800` reste « le texte sur ce fond ». Les
classes n'ont donc pas à savoir dans quel thème elles s'affichent. La direction
suit le readme du système : un noir chaud une nuance sous `--color-neutral-900`,
l'or en `--color-accent-400`, et une élévation d'obscurité ambiante plutôt que
d'ombres portées.

Trois états, comme il se doit :

| État | Ce qui se passe |
| --- | --- |
| Aucun choix (par défaut) | On suit `prefers-color-scheme`, y compris s'il change en cours de session |
| Choix explicite | `data-theme="dark"` \| `"light"` sur `<html>`, mémorisé dans `localStorage` |
| Rechargement | Un script inline en tête de page repose le choix **avant peinture** — pas de flash |

Le bouton dans l'en-tête (icônes Lucide *sun* / *moon*, inlinées) bascule vers
le thème opposé à celui qui est effectivement rendu, et porte un `aria-pressed`
et un `aria-label` qui suivent l'état.

Les seuls endroits où un token ne suffisait pas, tous deux traités dans le
fichier sombre : le voile de `.dialog-backdrop`, écrit en dur sur
`--color-neutral-900` dans le système, et le virage sépia de `.plate`, qui vire
au jaune sale sur fond sombre et devient une simple désaturation.

## Options de contenu

Les trois props éditables de la maquette sont regroupées en tête de
`src/app.js` :

```js
const OPTIONS = {
  proMode: true,      // bloc « Fiche professionnelle »
  showGallery: true,  // galerie de plaques
  showDaily: true,    // « Fiche du jour »
};
```

## Ce qui a été ajouté à la maquette

- **Routage par hash** — chaque région et chaque fiche a une adresse partageable,
  le bouton retour du navigateur fonctionne, et le titre du document suit la vue.
- **Responsive** — l'atlas passe en pleine largeur sous 720 px et les médaillons
  grossissent pour que les noms de région tiennent encore ; la fiche passe sur
  une colonne sous 1080 px.
- **Thème sombre** — voir plus haut ; il n'existait pas dans le design system.
- **Accessibilité** — `aria-pressed` sur le filtre, fil d'Ariane en `<nav>`,
  listes de définitions pour les repères, ingrédients et données professionnelles,
  anneau de focus clavier hérité du design system, animation neutralisée sous
  `prefers-reduced-motion`, et repères « Nord » / « Méditerranée » de la carte
  remontés de `--color-neutral-500` à `--color-neutral-700` (2,59:1 → 5,8:1 en
  clair, 7,9:1 en sombre).

## Données

31 fiches réparties sur 13 régions, reprises intégralement de la maquette
(aucune n'a été inventée ni retouchée). Toute correction éditoriale se fait
dans `src/data.js`.
