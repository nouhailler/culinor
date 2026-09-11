/* Terroir de France — application.
 *
 * A faithful implementation of the Claude Design maquette
 * `Terroir de France.dc.html`: the same four views (atlas, région, fiche,
 * recherche), the same derived labels, the same Classical design system.
 * The maquette's runtime is replaced by plain DOM rendering, and the view
 * state is mirrored into the URL hash so every région and every fiche is
 * a shareable address.
 */

import { REGIONS, SPECS, TEASERS, COL, FAM, APPELLATIONS } from './data.js';

/* ── content options (the maquette's editable props) ─────────────────── */

const OPTIONS = {
  proMode: true,      // bloc « Fiche professionnelle » dans la colonne de droite
  showGallery: true,  // galerie de plaques en bas de la fiche
  showDaily: true,    // « Fiche du jour » dans la colonne de l'atlas
};

/* ── the atlas: outline of France, and where each medallion sits ─────── */

const FRANCE_PATH = 'M712.173,163.062L743.735,187.722L838.026,200.8L809.271,270.442L804.979,341.374L787.403,359.292L756.64,351.776L760.003,376.783L713.107,434.492L713.598,479.247L745.653,462.494L771.076,504.759L769.702,532.844L792.018,568.979L769.17,600.323L791.178,675.954L830.423,686.421L824.654,729.761L762.222,789.032L618.981,766.78L514.255,800.105L505.899,859.721L420.853,872.017L339.511,825.373L312.335,845.857L180.625,794.832L154.101,754.579L194.662,697.475L218.711,501.186L154.668,393.285L108.802,339.795L10.801,293.241L11.082,220.678L97.25,206.559L204.772,239.551L191.082,126.285L249.465,172.279L401.177,100.294L421.806,19.365L476.661,0L485.484,34.842L514.63,36.562L544.08,76.247L589.036,122.564L621.736,114.201L679.036,157.744L693.71,165.956ZM926.062,829.178L969.902,787.742L989.199,871.598L970.942,950L935.736,932.439L913.963,866.928Z';

const PIN = {
  hdf:  { x: 52, y: 11 }, nor: { x: 28, y: 22 }, idf: { x: 52, y: 28 },
  ge:   { x: 78, y: 25 }, bre: { x: 8,  y: 29 }, pdl: { x: 24, y: 45 },
  cvl:  { x: 48, y: 45 }, bfc: { x: 72, y: 45 }, na:  { x: 25, y: 66 },
  ara:  { x: 57, y: 63 }, occ: { x: 34, y: 84 }, paca:{ x: 66, y: 81 },
  cor:  { x: 89, y: 87, small: true },
};

const TYPES = ['Tout', 'Fromage', 'Plat', 'Dessert', 'Charcuterie'];

/* Niveau : un second axe, orthogonal au type — « quelle nature de produit »
   contre « recette composée ou produit du terroir ». Le Niveau 3 (voir plus
   bas) n'a pas de niveau au sens de ce champ : c'est une couche à part. */
const NIVEAU_LABEL = { 1: 'Spécialité culinaire', 2: 'Produit du terroir' };
const NIVEAU_SHORT = { 1: 'Recette', 2: 'Produit' };

const CATEGORIES = ['AOP', 'AOC', 'IGP', 'Label Rouge', 'Vin', 'Eau-de-vie', 'Liqueur', 'Production locale'];

const FALLBACK_HIST =
  'Fiche en cours de rédaction par le comité éditorial : origine, aire de production ' +
  'et usages professionnels sont documentés à partir de l’Inventaire du patrimoine culinaire.';

/* ── helpers ─────────────────────────────────────────────────────────── */

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const typeColor = (t) => (COL[t] || ['var(--color-accent)'])[0];
const typeTint = (t) => (COL[t] || [null, 'transparent'])[1];
const regionColor = (id) => `var(--tdf-${FAM[id] || 'nordest'})`;
const regionName = (id) => REGIONS.find((r) => r.id === id)?.name ?? '';

/* Decorate a fiche the way the maquette's `specs()` decorates them — shared
   between the curated SPECS and whatever a visitor has imported locally. */
function decorate(s) {
  return {
    ...s,
    niveau: s.niveau === 2 ? 2 : 1,
    teaser: s.teaser || TEASERS[s.id] || '',
    regionName: regionName(s.r),
    col: typeColor(s.t),
    tint: typeTint(s.t),
    cuisson: s.cuisson || '—',
    hist: s.hist || FALLBACK_HIST,
    ing: s.ing || [],
    etapes: s.etapes || [],
    accords: s.accords || [],
    sourcing: s.sourcing || 'À sourcer auprès d’un producteur sous signe de qualité.',
    allergenes: s.allergenes || '—',
    cout: s.cout || '—',
  };
}

/* Every fiche — the curated inventory plus whatever this browser has
   imported through « Paramètres ». Rebuilt whenever that local set changes. */
let ALL = [];
function rebuildAll() { ALL = [...SPECS, ...customSpecs].map(decorate); }

const byId = (id) => ALL.find((s) => s.id === id);

/* Niveau 3 : même principe, mais une décoration et un stockage à part —
   ces entrées n'ont ni type ni recette, voir data.js pour la forme exacte. */
function decorateAppellation(a) {
  return {
    ...a,
    regionName: regionName(a.r),
    teaser: a.teaser || '',
    hist: a.hist || FALLBACK_HIST,
    caracteristiques: a.caracteristiques || '',
    accords: a.accords || [],
    sourcing: a.sourcing || 'À sourcer auprès d’un producteur ou d’un caviste sous signe de qualité.',
    allergenes: a.allergenes || '—',
    cout: a.cout || '—',
    depuis: a.depuis || '—',
    aire: a.aire || '—',
  };
}

let ALL_APPELLATIONS = [];
function rebuildAppellations() { ALL_APPELLATIONS = [...APPELLATIONS, ...customAppellations].map(decorateAppellation); }

const appellationById = (id) => ALL_APPELLATIONS.find((a) => a.id === id);

/* ── fiches importées localement (Paramètres → gabarit JSON) ─────────── */

const CUSTOM_KEY = 'tdf-custom-specs';
const APPELLATION_CUSTOM_KEY = 'tdf-custom-appellations';

function loadCustom() {
  try {
    const raw = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}
function saveCustom() {
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(customSpecs)); } catch { /* navigation privée */ }
}
function loadCustomAppellations() {
  try {
    const raw = JSON.parse(localStorage.getItem(APPELLATION_CUSTOM_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}
function saveCustomAppellations() {
  try { localStorage.setItem(APPELLATION_CUSTOM_KEY, JSON.stringify(customAppellations)); } catch { /* navigation privée */ }
}

let customSpecs = loadCustom();
rebuildAll();
let customAppellations = loadCustomAppellations();
rebuildAppellations();

const KNOWN_TYPES = ['Fromage', 'Plat', 'Dessert', 'Charcuterie'];
const KNOWN_DIFFS = ['Simple', 'Technique', 'Expert', 'Affinage'];

const slugify = (str) => String(str ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

/* Every id already in use, curated or imported, across both niveau spaces —
   a gabarit of either kind must not collide with any of them. */
function allKnownIds() {
  return new Set([
    ...SPECS.map((s) => s.id), ...customSpecs.map((s) => s.id),
    ...APPELLATIONS.map((a) => a.id), ...customAppellations.map((a) => a.id),
  ]);
}

/* Parses and checks a gabarit `{ region, fiches:[...] }` (niveaux 1 et 2)
   against the shape documented in templates/GUIDE.md. Returns either the
   ready-to-import fiches or the full list of problems found, so the dialog
   can show them all at once rather than one at a time. */
function validateGabarit(raw) {
  let data;
  try { data = JSON.parse(raw); } catch (e) { return { ok: false, errors: [`JSON invalide : ${e.message}`] }; }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, errors: ['Le document doit être un objet JSON avec les clés "region" et "fiches".'] };
  }

  const errors = [];
  const region = String(data.region ?? '').trim().toLowerCase();
  if (!region || !REGIONS.some((r) => r.id === region)) {
    errors.push(`region : « ${data.region ?? ''} » ne correspond à aucune des 13 régions (ex. « occ », « bre », « idf »).`);
  }

  const fichesRaw = Array.isArray(data.fiches) ? data.fiches : [];
  if (!fichesRaw.length) errors.push('fiches : le tableau est vide — au moins une spécialité est attendue.');

  const existingIds = allKnownIds();
  const customIds = new Set(customSpecs.map((s) => s.id));
  const seenIds = new Set();
  const fiches = [];

  fichesRaw.forEach((f, i) => {
    const where = `Fiche ${i + 1}${f && f.n ? ` (${f.n})` : ''}`;
    if (!f || typeof f !== 'object') { errors.push(`${where} : entrée invalide.`); return; }
    if (!String(f.n ?? '').trim()) { errors.push(`${where} : le nom (n) est obligatoire.`); return; }

    const id = slugify(f.id || f.n);
    if (!id) { errors.push(`${where} : impossible d'en tirer un identifiant.`); return; }
    if (existingIds.has(id) && !customIds.has(id)) {
      errors.push(`${where} : l'identifiant « ${id} » existe déjà dans l'inventaire.`); return;
    }
    if (seenIds.has(id)) { errors.push(`${where} : l'identifiant « ${id} » est en double dans ce fichier.`); return; }

    const t = KNOWN_TYPES.find((x) => x.toLowerCase() === String(f.t ?? '').toLowerCase());
    if (!t) { errors.push(`${where} : type (t) « ${f.t ?? ''} » doit être l'un de ${KNOWN_TYPES.join(', ')}.`); return; }

    const niveau = Number(f.niveau);
    if (![1, 2].includes(niveau)) {
      errors.push(`${where} : niveau doit être 1 (spécialité culinaire) ou 2 (produit du terroir).`); return;
    }

    const errorsBefore = errors.length;
    for (const [key, label] of [['ing', 'ingrédients (ing)'], ['etapes', 'étapes (etapes)'], ['accords', 'accords (accords)']]) {
      if (f[key] !== undefined && !Array.isArray(f[key])) errors.push(`${where} : ${label} doit être une liste.`);
    }
    if (errors.length > errorsBefore) return;

    seenIds.add(id);
    const diff = f.diff
      ? (KNOWN_DIFFS.find((d) => d.toLowerCase() === String(f.diff).toLowerCase()) || String(f.diff).trim())
      : 'Simple';

    fiches.push({
      id, r: region, n: String(f.n).trim(), t, niveau,
      aop: f.aop || '—', saison: f.saison || '—', temps: f.temps || '—', cuisson: f.cuisson || '—',
      diff, portions: f.portions || '—',
      teaser: f.teaser || '', hist: f.hist || '',
      ing: Array.isArray(f.ing) ? f.ing : [],
      etapes: Array.isArray(f.etapes) ? f.etapes : [],
      accords: Array.isArray(f.accords) ? f.accords : [],
      sourcing: f.sourcing || '', allergenes: f.allergenes || '—', cout: f.cout || '—',
      isUpdate: customIds.has(id),
    });
  });

  if (errors.length) return { ok: false, errors };
  return { ok: true, kind: 'fiches', region, fiches };
}

/* Parses and checks a gabarit `{ region, appellations:[...] }` (niveau 3) —
   AOP/AOC/IGP/Label Rouge, vins, eaux-de-vie, liqueurs, productions locales.
   Shape documented in templates/GUIDE.md. */
function validateAppellationGabarit(raw) {
  let data;
  try { data = JSON.parse(raw); } catch (e) { return { ok: false, errors: [`JSON invalide : ${e.message}`] }; }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, errors: ['Le document doit être un objet JSON avec les clés "region" et "appellations".'] };
  }

  const errors = [];
  const region = String(data.region ?? '').trim().toLowerCase();
  if (!region || !REGIONS.some((r) => r.id === region)) {
    errors.push(`region : « ${data.region ?? ''} » ne correspond à aucune des 13 régions (ex. « occ », « bre », « idf »).`);
  }

  const rawItems = Array.isArray(data.appellations) ? data.appellations : [];
  if (!rawItems.length) errors.push('appellations : le tableau est vide — au moins une entrée est attendue.');

  const existingIds = allKnownIds();
  const customIds = new Set(customAppellations.map((a) => a.id));
  const seenIds = new Set();
  const appellations = [];

  rawItems.forEach((f, i) => {
    const where = `Entrée ${i + 1}${f && f.n ? ` (${f.n})` : ''}`;
    if (!f || typeof f !== 'object') { errors.push(`${where} : entrée invalide.`); return; }
    if (!String(f.n ?? '').trim()) { errors.push(`${where} : le nom (n) est obligatoire.`); return; }

    const id = slugify(f.id || f.n);
    if (!id) { errors.push(`${where} : impossible d'en tirer un identifiant.`); return; }
    if (existingIds.has(id) && !customIds.has(id)) {
      errors.push(`${where} : l'identifiant « ${id} » existe déjà dans l'inventaire.`); return;
    }
    if (seenIds.has(id)) { errors.push(`${where} : l'identifiant « ${id} » est en double dans ce fichier.`); return; }

    const categorie = CATEGORIES.find((c) => c.toLowerCase() === String(f.categorie ?? '').toLowerCase());
    if (!categorie) {
      errors.push(`${where} : categorie « ${f.categorie ?? ''} » doit être l'une de ${CATEGORIES.join(', ')}.`); return;
    }
    if (f.accords !== undefined && !Array.isArray(f.accords)) {
      errors.push(`${where} : accords doit être une liste.`); return;
    }

    seenIds.add(id);
    appellations.push({
      id, r: region, n: String(f.n).trim(), categorie,
      depuis: f.depuis || '—', aire: f.aire || '—',
      teaser: f.teaser || '', hist: f.hist || '', caracteristiques: f.caracteristiques || '',
      accords: Array.isArray(f.accords) ? f.accords : [],
      sourcing: f.sourcing || '', allergenes: f.allergenes || '—', cout: f.cout || '—',
      isUpdate: customIds.has(id),
    });
  });

  if (errors.length) return { ok: false, errors };
  return { ok: true, kind: 'appellations', region, appellations };
}

/* Le champ qui distingue les deux gabarits : "fiches" (spécialités et
   produits, niveaux 1/2) ou "appellations" (niveau 3). */
function validateEither(raw) {
  let peek;
  try { peek = JSON.parse(raw); } catch (e) { return { ok: false, errors: [`JSON invalide : ${e.message}`] }; }
  if (peek && Array.isArray(peek.appellations)) return validateAppellationGabarit(raw);
  if (peek && Array.isArray(peek.fiches)) return validateGabarit(raw);
  return { ok: false, errors: ['Le document doit contenir soit "fiches" (spécialités et produits), soit "appellations".'] };
}

function commitImport(fiches) {
  fiches.forEach(({ isUpdate, ...f }) => {
    const idx = customSpecs.findIndex((c) => c.id === f.id);
    if (idx >= 0) customSpecs[idx] = f; else customSpecs.push(f);
  });
  saveCustom();
  rebuildAll();
}

function removeCustom(id) {
  customSpecs = customSpecs.filter((c) => c.id !== id);
  saveCustom();
  rebuildAll();
}

function resetCustom() {
  customSpecs = [];
  saveCustom();
  rebuildAll();
}

function commitAppellationImport(appellations) {
  appellations.forEach(({ isUpdate, ...a }) => {
    const idx = customAppellations.findIndex((c) => c.id === a.id);
    if (idx >= 0) customAppellations[idx] = a; else customAppellations.push(a);
  });
  saveCustomAppellations();
  rebuildAppellations();
}

function removeCustomAppellation(id) {
  customAppellations = customAppellations.filter((c) => c.id !== id);
  saveCustomAppellations();
  rebuildAppellations();
}

function resetCustomAppellations() {
  customAppellations = [];
  saveCustomAppellations();
  rebuildAppellations();
}

/* Sérialise les fiches importées dans la même syntaxe que SPECS / APPELLATIONS
   (src/data.js), prêtes à coller dans le dépôt pour les rendre permanentes. */
function escBacktick(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}
function toSpecLiteral(f) {
  const t = (s) => `\`${escBacktick(s)}\``;
  const ing = f.ing.map((i) => `{nom:${t(i.nom)},qte:${t(i.qte)}}`).join(',');
  const etapes = f.etapes.map((e) => t(e)).join(',');
  const accords = f.accords.map((a) => `{vin:${t(a.vin)},note:${t(a.note)}}`).join(',');
  return `  { id:${t(f.id)}, r:${t(f.r)}, n:${t(f.n)}, t:${t(f.t)}, niveau:${f.niveau}, aop:${t(f.aop)}, saison:${t(f.saison)}, temps:${t(f.temps)}, cuisson:${t(f.cuisson)}, diff:${t(f.diff)}, portions:${t(f.portions)},\n`
    + `    teaser:${t(f.teaser)},\n`
    + `    hist:${t(f.hist)},\n`
    + `    ing:[${ing}],\n`
    + `    etapes:[${etapes}],\n`
    + `    accords:[${accords}],\n`
    + `    sourcing:${t(f.sourcing)}, allergenes:${t(f.allergenes)}, cout:${t(f.cout)} },`;
}
function toAppellationLiteral(a) {
  const t = (s) => `\`${escBacktick(s)}\``;
  const accords = a.accords.map((x) => `{avec:${t(x.avec)},note:${t(x.note)}}`).join(',');
  return `  { id:${t(a.id)}, r:${t(a.r)}, n:${t(a.n)}, categorie:${t(a.categorie)}, depuis:${t(a.depuis)}, aire:${t(a.aire)},\n`
    + `    teaser:${t(a.teaser)},\n`
    + `    hist:${t(a.hist)},\n`
    + `    caracteristiques:${t(a.caracteristiques)},\n`
    + `    accords:[${accords}],\n`
    + `    sourcing:${t(a.sourcing)}, allergenes:${t(a.allergenes)}, cout:${t(a.cout)} },`;
}

/* ── state, mirrored in the URL hash ─────────────────────────────────── */

const state = { view: 'map', region: null, fiche: null, appellation: null, type: 'Tout', query: '' };

function readHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, search] = raw.split('?');
  const params = new URLSearchParams(search || '');
  const [kind, id] = path.split('/').filter(Boolean);

  state.query = params.get('q') || '';
  const type = params.get('type');
  state.type = TYPES.includes(type) ? type : 'Tout';

  if (kind === 'region' && REGIONS.some((r) => r.id === id)) {
    state.view = 'region';
    state.region = id;
  } else if (kind === 'fiche' && byId(id)) {
    state.view = 'fiche';
    state.fiche = id;
    state.region = byId(id).r;
  } else if (kind === 'appellation' && appellationById(id)) {
    state.view = 'appellation';
    state.appellation = id;
    state.region = appellationById(id).r;
  } else {
    state.view = 'map';
  }
}

function hashFor(next = {}) {
  const s = { ...state, ...next };
  let path = '/';
  if (s.view === 'region' && s.region) path = `/region/${s.region}`;
  else if (s.view === 'fiche' && s.fiche) path = `/fiche/${s.fiche}`;
  else if (s.view === 'appellation' && s.appellation) path = `/appellation/${s.appellation}`;

  const params = new URLSearchParams();
  if (s.query.trim()) params.set('q', s.query.trim());
  if (s.type !== 'Tout') params.set('type', s.type);
  const qs = params.toString();
  return `#${path}${qs ? `?${qs}` : ''}`;
}

/* `replace` keeps typing in the search box out of the history stack. */
function go(next, { replace = false } = {}) {
  const target = hashFor(next);
  if (target === location.hash) { Object.assign(state, next); render(); return; }
  if (replace) history.replaceState(null, '', target);
  else location.hash = target;
  if (replace) { readHash(); render(); }
}

/* ── views ───────────────────────────────────────────────────────────── */

function filteredByType() {
  return state.type === 'Tout' ? ALL : ALL.filter((s) => s.t === state.type);
}

function searchResults() {
  const q = state.query.trim().toLowerCase();
  if (!q) return { specs: [], appellations: [] };
  const specs = ALL.filter((s) => (
    s.n.toLowerCase().includes(q) ||
    s.regionName.toLowerCase().includes(q) ||
    s.t.toLowerCase().includes(q) ||
    s.teaser.toLowerCase().includes(q) ||
    s.ing.some((i) => i.nom.toLowerCase().includes(q))
  ));
  const appellations = ALL_APPELLATIONS.filter((a) => (
    a.n.toLowerCase().includes(q) ||
    a.regionName.toLowerCase().includes(q) ||
    a.categorie.toLowerCase().includes(q) ||
    a.teaser.toLowerCase().includes(q)
  ));
  return { specs, appellations };
}

/* A fiche rendered as a clickable card — shared by the search and région views. */
function specCard(s, { rightSlot, meta, tinted, titleClass }) {
  return `
    <button class="card card-btn" type="button" data-fiche="${esc(s.id)}"
            style="${tinted ? `border-left:3px solid ${s.col};background:${s.tint};` : ''}">
      <span class="card-kicker card-kicker-row" style="color:${s.col}">
        <span>${esc(s.t)} · ${esc(NIVEAU_SHORT[s.niveau])}</span><span class="muted">${esc(rightSlot)}</span>
      </span>
      <span class="card-title ${titleClass}">${esc(s.n)}</span>
      <span class="card-body">${esc(s.teaser)}</span>
      <span class="card-meta tnum">${esc(meta)}</span>
    </button>`;
}

/* A niveau 3 entry rendered as a clickable card — shared by the search,
   région and fiche (siblings) views. Its own fixed look — a gold rule —
   rather than specCard's params, since its fields don't match a recette. */
function appellationCard(a) {
  return `
    <button class="card card-btn" type="button" data-appellation="${esc(a.id)}"
            style="border-left:3px solid var(--color-accent);background:var(--color-accent-100);">
      <span class="card-kicker card-kicker-row" style="color:var(--color-accent-700)">
        <span>${esc(a.categorie)}</span><span class="muted">${esc(a.depuis !== '—' ? a.depuis : a.aire)}</span>
      </span>
      <span class="card-title card-title-lg">${esc(a.n)}</span>
      <span class="card-body">${esc(a.teaser)}</span>
    </button>`;
}

function viewSearch() {
  const { specs, appellations } = searchResults();
  const total = specs.length + appellations.length;
  return `
    <div class="tdf-main-narrow">
      <p class="tdf-kicker">Recherche</p>
      <h1 class="tdf-search-title">${esc(state.query)}</h1>
      <p class="tdf-search-count">${esc(plural(total, 'résultat'))}</p>
      <div class="hr" style="margin-bottom:var(--space-6)"></div>
      ${total ? `
        <div class="tdf-grid tdf-grid-285">
          ${specs.map((s) => specCard(s, {
            rightSlot: s.regionName, meta: `${s.temps} · ${s.diff}`, titleClass: 'card-title-sm',
          })).join('')}
          ${appellations.map((a) => appellationCard(a)).join('')}
        </div>` : `
        <p class="tdf-empty">Aucune fiche ne correspond à cette recherche. L’inventaire
        porte sur ${ALL.length + ALL_APPELLATIONS.length} entrées : essayez un nom de région, un
        type de produit (fromage, plat, dessert, charcuterie) ou un ingrédient.</p>`}
    </div>`;
}

function viewMap() {
  const filtered = filteredByType();
  /* Les appellations n'ont pas de type : elles ne comptent que quand aucun
     filtre de type n'est actif, sinon le décompte mélangerait deux axes. */
  const count = (id) => plural(
    filtered.filter((s) => s.r === id).length
      + (state.type === 'Tout' ? ALL_APPELLATIONS.filter((a) => a.r === id).length : 0),
    'fiche',
  );

  const pins = REGIONS.map((r) => {
    const p = PIN[r.id];
    if (!p) return '';
    return `
      <button class="tdf-pin${p.small ? ' tdf-pin-sm' : ''}" type="button" data-region="${esc(r.id)}"
              style="left:${p.x}%;top:${p.y}%;--tdf-col:${regionColor(r.id)}">
        <span class="tdf-pin-name">${esc(r.name)}</span>
        <span class="tdf-pin-count">${esc(count(r.id))}</span>
      </button>`;
  }).join('');

  const types = TYPES.map((t) => {
    const total = t === 'Tout' ? ALL.length : ALL.filter((s) => s.t === t).length;
    const col = t === 'Tout' ? 'var(--color-neutral-500)' : typeColor(t);
    const fg = t === 'Tout' ? 'var(--color-text)' : typeColor(t);
    const bg = state.type === t
      ? (t === 'Tout' ? 'var(--color-neutral-200)' : typeTint(t))
      : 'transparent';
    return `
      <button class="tag tdf-type" type="button" data-type="${esc(t)}"
              aria-pressed="${state.type === t}"
              style="--tdf-col:${col};--tdf-fg:${fg};--tdf-bg:${bg}">${esc(t)} (${total})</button>`;
  }).join('');

  const daily = ALL[new Date().getDate() % ALL.length];
  const dailyBlock = OPTIONS.showDaily ? `
    <div>
      <p class="tdf-kicker">Fiche du jour</p>
      <button class="card card-btn elev-sm tdf-daily" type="button" data-fiche="${esc(daily.id)}"
              style="background:${daily.tint};--tdf-col:${daily.col}">
        <span class="card-kicker" style="color:${daily.col}">${esc(daily.t)} · ${esc(daily.regionName)}</span>
        <span class="card-title card-title-md">${esc(daily.n)}</span>
        <span class="card-body">${esc(daily.teaser)}</span>
        <span class="card-meta tnum">${esc(daily.saison)} · ${esc(daily.temps)}</span>
      </button>
    </div>
    <div class="hr"></div>` : '';

  const rows = REGIONS.map((r) => `
    <button class="tdf-region-row" type="button" data-region="${esc(r.id)}">
      <span class="tdf-region-row-name">
        <span class="tdf-dot" style="--tdf-col:${regionColor(r.id)}"></span>
        <span>${esc(r.name)}</span>
      </span>
      <span class="tdf-region-row-count">${esc(count(r.id))}</span>
    </button>`).join('');

  const filterLabel = state.type === 'Tout'
    ? 'Tous types de produits'
    : `Filtré : ${state.type.toLowerCase()}s`;

  return `
    <div class="tdf-atlas">
      <section class="tdf-atlas-main">
        <p class="tdf-kicker">Atlas des régions</p>
        <h1 class="tdf-atlas-title">Les treize terroirs</h1>
        <p class="tdf-atlas-lede">Chaque médaillon porte une région administrative et le nombre de
        fiches inventoriées — produits du terroir, plats emblématiques, desserts et charcuteries.
        Le filtre ci-contre restreint le décompte au type de produit sélectionné.</p>

        <div class="tdf-map">
          <svg viewBox="0 0 1000 950" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <path d="${FRANCE_PATH}" stroke-width="2.5" stroke-linejoin="round"
                  vector-effect="non-scaling-stroke"></path>
          </svg>
          <span class="tdf-map-label tdf-map-label-n">Nord</span>
          <span class="tdf-map-label tdf-map-label-s">Méditerranée</span>
          ${pins}
        </div>
      </section>

      <aside class="tdf-aside">
        <div>
          <p class="tdf-kicker tdf-kicker-muted">Type de produit</p>
          <div class="tdf-types">${types}</div>
        </div>

        <div class="hr"></div>
        ${dailyBlock}

        <div>
          <p class="tdf-kicker tdf-kicker-muted" style="margin-bottom:var(--space-1)">Régions</p>
          <p class="tdf-filter-label">${esc(filterLabel)}</p>
          <div class="tdf-region-rows">${rows}</div>
        </div>
      </aside>
    </div>`;
}

function viewRegion() {
  const region = REGIONS.find((r) => r.id === state.region) || REGIONS[0];
  const specs = ALL.filter((s) => s.r === region.id);
  const appellations = ALL_APPELLATIONS.filter((a) => a.r === region.id);
  const col = regionColor(region.id);
  const aop = specs.filter((s) => s.aop !== '—').length;

  return `
    <div class="tdf-main-region tdf-enter">
      <button class="tdf-back" type="button" data-nav="map" style="margin-bottom:var(--space-6)">← Atlas</button>
      <div class="tdf-region-head">
        <div>
          <p class="tdf-kicker" style="color:${col}">Région</p>
          <h1 class="tdf-region-title">${esc(region.name)}</h1>
          <div class="tdf-rule" style="background:${col}"></div>
          <p class="tdf-region-desc">${esc(region.desc)}</p>
        </div>
        <div class="card tdf-facts" style="--tdf-col:${col}">
          <span class="card-kicker" style="color:${col}">Repères</span>
          <dl class="tdf-facts-list">
            <div class="tdf-fact tnum"><dt>Fiches</dt><dd>${esc(plural(specs.length, 'fiche'))}</dd></div>
            <div class="tdf-fact tnum"><dt>Signes de qualité</dt><dd>${aop} sur ${specs.length}</dd></div>
            ${appellations.length ? `
            <div class="tdf-fact tnum"><dt>Appellations &amp; productions</dt><dd>${appellations.length}</dd></div>` : ''}
            <div class="tdf-fact"><dt>Capitale</dt><dd>${esc(region.capitale)}</dd></div>
            <div class="tdf-fact"><dt>Saison forte</dt><dd>${esc(region.saison)}</dd></div>
          </dl>
          <div class="hr" style="margin:var(--space-1) 0"></div>
          <span class="card-meta" style="line-height:1.5">${esc(region.produits)}</span>
        </div>
      </div>

      <div class="hr" style="margin:var(--space-8) 0 var(--space-6)"></div>
      <p class="tdf-kicker tdf-kicker-muted" style="margin-bottom:var(--space-4)">Spécialités inventoriées</p>
      <div class="tdf-grid tdf-grid-300">
        ${specs.map((s) => specCard(s, {
          rightSlot: s.aop, meta: `${s.temps} · ${s.diff} · ${s.saison}`,
          tinted: true, titleClass: 'card-title-lg',
        })).join('')}
      </div>

      ${appellations.length ? `
      <div class="hr" style="margin:var(--space-8) 0 var(--space-6)"></div>
      <p class="tdf-kicker tdf-kicker-muted" style="margin-bottom:var(--space-4)">Appellations &amp; productions</p>
      <div class="tdf-grid tdf-grid-300">
        ${appellations.map((a) => appellationCard(a)).join('')}
      </div>` : ''}
    </div>`;
}

function viewFiche() {
  const fiche = byId(state.fiche) || ALL[0];
  const siblings = ALL.filter((s) => s.r === fiche.r && s.id !== fiche.id);

  const stat = (label, value) => `<div class="tdf-stat"><dt>${label}</dt><dd>${esc(value)}</dd></div>`;

  /* One fiche of the inventory is still being written up (see FALLBACK_HIST).
     Rather than print three empty containers, drop the sections it lacks. */
  const steps = fiche.etapes.length ? `
    <div class="hr" style="margin-bottom:var(--space-6)"></div>
    <h2 class="tdf-section-title" style="margin-bottom:var(--space-4)">Préparation</h2>
    <ol class="tdf-steps">
      ${fiche.etapes.map((txt, i) => `
        <li class="tdf-step">
          <span class="tdf-step-no" style="--tdf-col:${fiche.col}">${String(i + 1).padStart(2, '0')}</span>
          <span class="tdf-step-txt">${esc(txt)}</span>
        </li>`).join('')}
    </ol>` : '';

  const ingredients = fiche.ing.length ? `
    <div class="card tdf-ing-card" style="--tdf-tint:${fiche.tint};--tdf-col:${fiche.col}">
      <span class="card-kicker" style="color:${fiche.col}">Ingrédients — ${esc(fiche.portions)}</span>
      <dl class="tdf-ing-list">
        ${fiche.ing.map((i) => `
          <div class="tdf-ing"><dt>${esc(i.nom)}</dt><dd>${esc(i.qte)}</dd></div>`).join('')}
      </dl>
    </div>` : '';

  const accords = fiche.accords.length ? `
    <div>
      <h2 class="tdf-section-title">Accords mets &amp; vins</h2>
      <div class="tdf-accords">
        ${fiche.accords.map((a) => `
          <span class="tdf-accord">
            <span class="tdf-accord-vin">${esc(a.vin)}</span>
            <span class="tdf-accord-note">${esc(a.note)}</span>
          </span>`).join('')}
      </div>
    </div>` : '';

  const gallery = OPTIONS.showGallery ? `
    <div class="hr" style="margin:var(--space-8) 0 var(--space-4)"></div>
    <h2 class="tdf-section-title">Galerie</h2>
    <div class="tdf-gallery">
      <div class="plate">Plat dressé</div>
      <div class="plate">Produit brut</div>
      <div class="plate">Terroir</div>
    </div>` : '';

  const pro = OPTIONS.proMode ? `
    <div class="card tdf-pro">
      <span class="card-kicker" style="color:var(--color-accent-700)">Fiche professionnelle</span>
      <dl class="tdf-pro-list">
        <div class="tdf-pro-item"><dt>Approvisionnement</dt><dd>${esc(fiche.sourcing)}</dd></div>
        <div class="tdf-pro-item"><dt>Allergènes</dt><dd>${esc(fiche.allergenes)}</dd></div>
        <div class="tdf-pro-item"><dt>Coût matière indicatif</dt><dd class="tnum">${esc(fiche.cout)}</dd></div>
      </dl>
    </div>` : '';

  return `
    <div class="tdf-main-fiche tdf-enter">
      <nav class="tdf-crumbs" aria-label="Fil d’Ariane">
        <button class="tdf-back" type="button" data-nav="map">← Atlas</button>
        <button class="tdf-back tdf-back-muted" type="button" data-region="${esc(fiche.r)}">${esc(fiche.regionName)}</button>
      </nav>

      <div class="tdf-fiche-tags">
        <span class="tag" style="border:1px solid ${fiche.col};color:${fiche.col}">${esc(fiche.t)}</span>
        <span class="tag tag-neutral">${esc(NIVEAU_LABEL[fiche.niveau])}</span>
        <span class="tag tag-accent">${esc(fiche.aop)}</span>
        <span class="tdf-fiche-region">${esc(fiche.regionName)}</span>
      </div>
      <h1 class="tdf-fiche-title">${esc(fiche.n)}</h1>
      <div class="tdf-rule tdf-fiche-rule" style="background:${fiche.col}"></div>

      <dl class="tdf-stats">
        ${stat('Préparation', fiche.temps)}
        ${stat('Cuisson', fiche.cuisson)}
        ${stat('Portions', fiche.portions)}
        ${stat('Difficulté', fiche.diff)}
        ${stat('Saison', fiche.saison)}
      </dl>

      <div class="tdf-fiche-body">
        <div>
          <h2 class="tdf-section-title">Origine &amp; histoire</h2>
          <p class="tdf-hist">${esc(fiche.hist)}</p>

          ${steps}
          ${gallery}
        </div>

        <aside class="tdf-fiche-aside">
          ${ingredients}
          ${accords}

          ${pro}

          ${siblings.length ? `
          <div>
            <p class="tdf-kicker tdf-kicker-muted">Dans la même région</p>
            <div class="tdf-siblings">
              ${siblings.map((s) => `
                <button class="tdf-sibling" type="button" data-fiche="${esc(s.id)}">
                  <span class="tdf-sibling-name">${esc(s.n)}</span>
                  <span class="tdf-sibling-type">${esc(s.t)}</span>
                </button>`).join('')}
            </div>
          </div>` : ''}
        </aside>
      </div>
    </div>`;
}

/* Niveau 3 — pas de recette : pas d'étapes, pas d'ingrédients, pas de
   portions. « Depuis » et « Aire de production » remplacent les stats de
   préparation, et « Caractéristiques » remplace la liste d'ingrédients. */
function viewAppellation() {
  const a = appellationById(state.appellation) || ALL_APPELLATIONS[0];
  const siblings = ALL_APPELLATIONS.filter((x) => x.r === a.r && x.id !== a.id);

  const caracteristiques = a.caracteristiques ? `
    <div class="hr" style="margin-bottom:var(--space-6)"></div>
    <h2 class="tdf-section-title" style="margin-bottom:var(--space-4)">Caractéristiques</h2>
    <p class="tdf-hist">${esc(a.caracteristiques)}</p>` : '';

  const accords = a.accords.length ? `
    <div>
      <h2 class="tdf-section-title">Accords &amp; usages</h2>
      <div class="tdf-accords">
        ${a.accords.map((x) => `
          <span class="tdf-accord">
            <span class="tdf-accord-vin">${esc(x.avec)}</span>
            <span class="tdf-accord-note">${esc(x.note)}</span>
          </span>`).join('')}
      </div>
    </div>` : '';

  const pro = OPTIONS.proMode ? `
    <div class="card tdf-pro">
      <span class="card-kicker" style="color:var(--color-accent-700)">Fiche professionnelle</span>
      <dl class="tdf-pro-list">
        <div class="tdf-pro-item"><dt>Approvisionnement</dt><dd>${esc(a.sourcing)}</dd></div>
        <div class="tdf-pro-item"><dt>Allergènes</dt><dd>${esc(a.allergenes)}</dd></div>
        <div class="tdf-pro-item"><dt>Coût indicatif</dt><dd class="tnum">${esc(a.cout)}</dd></div>
      </dl>
    </div>` : '';

  return `
    <div class="tdf-main-fiche tdf-enter">
      <nav class="tdf-crumbs" aria-label="Fil d’Ariane">
        <button class="tdf-back" type="button" data-nav="map">← Atlas</button>
        <button class="tdf-back tdf-back-muted" type="button" data-region="${esc(a.r)}">${esc(a.regionName)}</button>
      </nav>

      <div class="tdf-fiche-tags">
        <span class="tag" style="border:1px solid var(--color-accent);color:var(--color-accent-700)">${esc(a.categorie)}</span>
        <span class="tag tag-neutral">Appellation &amp; production</span>
        <span class="tdf-fiche-region">${esc(a.regionName)}</span>
      </div>
      <h1 class="tdf-fiche-title">${esc(a.n)}</h1>
      <div class="tdf-rule tdf-fiche-rule" style="background:var(--color-accent)"></div>

      <dl class="tdf-stats">
        <div class="tdf-stat"><dt>Depuis</dt><dd>${esc(a.depuis)}</dd></div>
        <div class="tdf-stat"><dt>Aire de production</dt><dd>${esc(a.aire)}</dd></div>
      </dl>

      <div class="tdf-fiche-body">
        <div>
          <h2 class="tdf-section-title">Origine &amp; histoire</h2>
          <p class="tdf-hist">${esc(a.hist)}</p>
          ${caracteristiques}
        </div>

        <aside class="tdf-fiche-aside">
          ${accords}

          ${pro}

          ${siblings.length ? `
          <div>
            <p class="tdf-kicker tdf-kicker-muted">Dans la même région</p>
            <div class="tdf-siblings">
              ${siblings.map((x) => `
                <button class="tdf-sibling" type="button" data-appellation="${esc(x.id)}">
                  <span class="tdf-sibling-name">${esc(x.n)}</span>
                  <span class="tdf-sibling-type">${esc(x.categorie)}</span>
                </button>`).join('')}
            </div>
          </div>` : ''}
        </aside>
      </div>
    </div>`;
}

/* ── render & wiring ─────────────────────────────────────────────────── */

const view = document.getElementById('view');
const input = document.getElementById('q');
const clear = document.getElementById('q-clear');
const totalLabel = document.getElementById('total-label');

function render() {
  const searching = !!state.query.trim();
  view.innerHTML = searching ? viewSearch()
    : state.view === 'region' ? viewRegion()
    : state.view === 'fiche' ? viewFiche()
    : state.view === 'appellation' ? viewAppellation()
    : viewMap();

  if (input.value !== state.query) input.value = state.query;
  clear.hidden = !state.query;
  totalLabel.textContent = `${ALL.length + ALL_APPELLATIONS.length} fiches · ${REGIONS.length} régions`;

  document.title = searching
    ? `« ${state.query} » — Terroir de France`
    : state.view === 'fiche' ? `${byId(state.fiche)?.n ?? ''} — Terroir de France`
    : state.view === 'appellation' ? `${appellationById(state.appellation)?.n ?? ''} — Terroir de France`
    : state.view === 'region' ? `${regionName(state.region)} — Terroir de France`
    : 'Terroir de France — Inventaire du patrimoine culinaire';
}

/* ── thème clair / sombre ────────────────────────────────────────────── */

/* Trois états : un choix explicite est mémorisé et stampé sur <html> (le
 * script en tête de page le repose avant peinture) ; sans choix, on suit la
 * préférence système et on la suit encore si elle change en cours de route. */

const themeBtn = document.getElementById('theme');
const systemDark = matchMedia('(prefers-color-scheme: dark)');

const resolvedTheme = () => document.documentElement.dataset.theme
  || (systemDark.matches ? 'dark' : 'light');

function syncThemeButton() {
  const dark = resolvedTheme() === 'dark';
  themeBtn.setAttribute('aria-pressed', String(dark));
  const label = dark ? 'Passer au thème clair' : 'Passer au thème sombre';
  themeBtn.setAttribute('aria-label', label);
  themeBtn.title = label;
}

themeBtn.addEventListener('click', () => {
  const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('tdf-theme', next); } catch { /* navigation privée */ }
  syncThemeButton();
});

systemDark.addEventListener('change', syncThemeButton);
syncThemeButton();

/* ── paramètres : import de gabarit ───────────────────────────────────

   La fenêtre montre trois états : le formulaire (coller/charger un JSON,
   spécialités/produits ou appellations), l'aperçu d'un gabarit validé (à
   confirmer), ou les erreurs trouvées. Sous ce formulaire, tout ce qui a
   déjà été importé dans ce navigateur reste listé, séparément pour chaque
   niveau, avec de quoi le retirer ou en récupérer le code pour data.js. */

const settingsBtn = document.getElementById('settings-btn');
const settingsRoot = document.getElementById('settings-root');

let settingsOpen = false;
let importDraft = { text: '', result: null };
let settingsCopyFeedback = false;
let appellationCopyFeedback = false;
let templateCopyFeedback = { fiches: false, appellations: false };

/* Les gabarits vides (templates/gabarit-*.json) restent la seule source —
   on va les chercher au premier besoin plutôt que d'en garder une copie ici. */
const TEMPLATE_FILES = {
  fiches: 'templates/gabarit-specialites.json',
  appellations: 'templates/gabarit-appellations.json',
};
const templateTexts = { fiches: null, appellations: null };
async function loadTemplate(kind) {
  if (templateTexts[kind] !== null) return templateTexts[kind];
  try {
    const res = await fetch(TEMPLATE_FILES[kind]);
    templateTexts[kind] = await res.text();
  } catch { templateTexts[kind] = ''; }
  return templateTexts[kind];
}

function openSettings() {
  settingsOpen = true;
  importDraft = { text: '', result: null };
  renderSettings();
}
function closeSettings() {
  settingsOpen = false;
  renderSettings();
  settingsBtn.focus();
}

/* Refresh the main view after a removal or a reset — if that took away the
   fiche currently on screen, fall back to the atlas instead of leaving the
   address bar pointed at a fiche that no longer exists. */
function afterCustomChange() {
  if (state.view === 'fiche' && !byId(state.fiche)) { go({ view: 'map', fiche: null, query: '' }); return; }
  if (state.view === 'appellation' && !appellationById(state.appellation)) {
    go({ view: 'map', appellation: null, query: '' }); return;
  }
  render();
}

function renderSettings() {
  if (!settingsOpen) { settingsRoot.innerHTML = ''; return; }

  const { text, result } = importDraft;

  const customSpecsBlock = customSpecs.length ? `
    <p class="tdf-kicker tdf-kicker-muted">Spécialités &amp; produits importés (${customSpecs.length})</p>
    <dl class="tdf-settings-list">
      ${customSpecs.map((s) => `
        <div class="tdf-settings-row">
          <span class="tdf-settings-row-name">${esc(s.n)}</span>
          <span class="tdf-settings-row-meta">${esc(regionName(s.r))} · ${esc(s.t)} · ${esc(NIVEAU_SHORT[s.niveau])}</span>
          <button class="btn btn-ghost" type="button" data-settings-remove="${esc(s.id)}">Retirer</button>
        </div>`).join('')}
    </dl>
    <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-4)">
      <button class="btn btn-secondary" type="button" data-settings-copy>${settingsCopyFeedback ? 'Copié !' : 'Copier le code pour data.js'}</button>
      <button class="btn btn-secondary" type="button" data-settings-reset>Tout réinitialiser</button>
    </div>
    <div class="hr" style="margin-bottom:var(--space-4)"></div>` : '';

  const customAppellationsBlock = customAppellations.length ? `
    <p class="tdf-kicker tdf-kicker-muted">Appellations &amp; productions importées (${customAppellations.length})</p>
    <dl class="tdf-settings-list">
      ${customAppellations.map((a) => `
        <div class="tdf-settings-row">
          <span class="tdf-settings-row-name">${esc(a.n)}</span>
          <span class="tdf-settings-row-meta">${esc(regionName(a.r))} · ${esc(a.categorie)}</span>
          <button class="btn btn-ghost" type="button" data-settings-remove-appellation="${esc(a.id)}">Retirer</button>
        </div>`).join('')}
    </dl>
    <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-4)">
      <button class="btn btn-secondary" type="button" data-settings-copy-appellation>${appellationCopyFeedback ? 'Copié !' : 'Copier le code pour data.js'}</button>
      <button class="btn btn-secondary" type="button" data-settings-reset-appellation>Tout réinitialiser</button>
    </div>
    <div class="hr" style="margin-bottom:var(--space-4)"></div>` : '';

  let body;
  if (result && result.ok) {
    const items = result.kind === 'appellations' ? result.appellations : result.fiches;
    const label = result.kind === 'appellations' ? 'appellation' : 'fiche';
    body = `
      <p class="dialog-body">${esc(plural(items.length, label))} valide${items.length > 1 ? 's' : ''}
      pour <strong>${esc(regionName(result.region))}</strong> :</p>
      <dl class="tdf-settings-list">
        ${items.map((f) => `
          <div class="tdf-settings-row">
            <span class="tdf-settings-row-name">${esc(f.n)}${f.isUpdate ? ' <em>(mise à jour)</em>' : ''}</span>
            <span class="tdf-settings-row-meta">${result.kind === 'appellations' ? esc(f.categorie) : `${esc(f.t)} · ${esc(NIVEAU_SHORT[f.niveau])}`}</span>
          </div>`).join('')}
      </dl>
      <div class="dialog-actions">
        <button class="btn btn-secondary" type="button" data-settings-back>← Modifier</button>
        <button class="btn btn-primary" type="button" data-settings-commit>Ajouter à l'atlas</button>
      </div>`;
  } else {
    const errorBlock = result && !result.ok ? `
      <div class="card tdf-settings-errors">
        <span class="card-kicker" style="color:var(--color-accent-700)">${esc(plural(result.errors.length, 'problème'))} à corriger</span>
        <ul>${result.errors.map((msg) => `<li>${esc(msg)}</li>`).join('')}</ul>
      </div>` : '';
    body = `
      <p class="dialog-body">Colle un gabarit JSON — spécialités/produits (<code>"fiches"</code>) ou
      appellations (<code>"appellations"</code>) — pars d'un gabarit vide ci-dessous, ou charge un
      fichier. L'ajout reste local à ce navigateur — utilise « Copier le code pour data.js »
      plus bas pour le rendre permanent. Détail des champs : <code>templates/GUIDE.md</code>.</p>
      <div class="field">
        <div style="display:flex;align-items:baseline;justify-content:space-between;gap:var(--space-3);flex-wrap:wrap">
          <label for="settings-json">Gabarit JSON</label>
          <span style="display:flex;gap:var(--space-3);flex-wrap:wrap">
            <button class="btn btn-ghost" type="button" style="padding:0;font-size:12px" data-settings-insert-template="fiches">Insérer : spécialité/produit</button>
            <button class="btn btn-ghost" type="button" style="padding:0;font-size:12px" data-settings-copy-template="fiches">${templateCopyFeedback.fiches ? 'Copié !' : 'Copier : spécialité/produit'}</button>
            <button class="btn btn-ghost" type="button" style="padding:0;font-size:12px" data-settings-insert-template="appellations">Insérer : appellation</button>
            <button class="btn btn-ghost" type="button" style="padding:0;font-size:12px" data-settings-copy-template="appellations">${templateCopyFeedback.appellations ? 'Copié !' : 'Copier : appellation'}</button>
          </span>
        </div>
        <textarea id="settings-json" class="input tdf-json-input"
                  placeholder='{"region":"idf","fiches":[...]} ou {"region":"idf","appellations":[...]}'>${esc(text)}</textarea>
      </div>
      <input id="settings-file" type="file" accept=".json,application/json">
      ${errorBlock}
      <div class="dialog-actions">
        <button class="btn btn-primary" type="button" data-settings-validate>Valider</button>
      </div>`;
  }

  settingsRoot.innerHTML = `
    <div class="dialog-backdrop" data-settings-backdrop>
      <div class="dialog" style="width:min(640px,100%);max-height:85vh;overflow:auto"
           role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-3)">
          <span class="dialog-title" id="settings-title">Paramètres — enrichir l'inventaire</span>
          <button class="btn btn-icon" type="button" data-settings-close aria-label="Fermer">✕</button>
        </div>
        ${customSpecsBlock}
        ${customAppellationsBlock}
        ${body}
      </div>
    </div>`;

  settingsRoot.querySelector('#settings-json, [data-settings-commit]')?.focus();
}

settingsBtn.addEventListener('click', openSettings);

settingsRoot.addEventListener('click', (e) => {
  if (e.target.matches('[data-settings-backdrop]') || e.target.closest('[data-settings-close]')) {
    closeSettings(); return;
  }
  if (e.target.closest('[data-settings-validate]')) {
    const text = settingsRoot.querySelector('#settings-json').value;
    importDraft = { text, result: validateEither(text) };
    renderSettings(); return;
  }
  const insertBtn = e.target.closest('[data-settings-insert-template]');
  if (insertBtn) {
    const kind = insertBtn.dataset.settingsInsertTemplate;
    const current = settingsRoot.querySelector('#settings-json').value;
    if (current.trim() && !confirm('Remplacer le contenu actuel par le gabarit vide ?')) return;
    loadTemplate(kind).then((tpl) => { importDraft = { text: tpl, result: null }; renderSettings(); });
    return;
  }
  const copyTplBtn = e.target.closest('[data-settings-copy-template]');
  if (copyTplBtn) {
    const kind = copyTplBtn.dataset.settingsCopyTemplate;
    loadTemplate(kind).then((tpl) => navigator.clipboard?.writeText(tpl)).then(() => {
      templateCopyFeedback[kind] = true;
      renderSettings();
      setTimeout(() => { templateCopyFeedback[kind] = false; renderSettings(); }, 1600);
    }).catch(() => {});
    return;
  }
  if (e.target.closest('[data-settings-back]')) {
    importDraft = { text: importDraft.text, result: null };
    renderSettings(); return;
  }
  if (e.target.closest('[data-settings-commit]')) {
    const { result } = importDraft;
    if (result.kind === 'appellations') commitAppellationImport(result.appellations);
    else commitImport(result.fiches);
    importDraft = { text: '', result: null };
    renderSettings();
    render();
    return;
  }
  const rm = e.target.closest('[data-settings-remove]');
  if (rm) { removeCustom(rm.dataset.settingsRemove); renderSettings(); afterCustomChange(); return; }
  const rma = e.target.closest('[data-settings-remove-appellation]');
  if (rma) { removeCustomAppellation(rma.dataset.settingsRemoveAppellation); renderSettings(); afterCustomChange(); return; }

  if (e.target.closest('[data-settings-copy]')) {
    const code = customSpecs.map(toSpecLiteral).join('\n');
    navigator.clipboard?.writeText(code).then(() => {
      settingsCopyFeedback = true;
      renderSettings();
      setTimeout(() => { settingsCopyFeedback = false; renderSettings(); }, 1600);
    }).catch(() => {});
    return;
  }
  if (e.target.closest('[data-settings-copy-appellation]')) {
    const code = customAppellations.map(toAppellationLiteral).join('\n');
    navigator.clipboard?.writeText(code).then(() => {
      appellationCopyFeedback = true;
      renderSettings();
      setTimeout(() => { appellationCopyFeedback = false; renderSettings(); }, 1600);
    }).catch(() => {});
    return;
  }
  if (e.target.closest('[data-settings-reset]')) {
    if (confirm(`Retirer les ${customSpecs.length} spécialités/produits importés dans ce navigateur ?`)) {
      resetCustom();
      renderSettings();
      afterCustomChange();
    }
    return;
  }
  if (e.target.closest('[data-settings-reset-appellation]')) {
    if (confirm(`Retirer les ${customAppellations.length} appellations importées dans ce navigateur ?`)) {
      resetCustomAppellations();
      renderSettings();
      afterCustomChange();
    }
  }
});

settingsRoot.addEventListener('change', async (e) => {
  if (e.target.id !== 'settings-file') return;
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  importDraft = { text, result: validateEither(text) };
  renderSettings();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && settingsOpen) closeSettings();
});

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-nav],[data-region],[data-fiche],[data-appellation],[data-type]');
  if (!el) return;

  if (el.dataset.type) { go({ type: el.dataset.type }); return; }
  if (el.dataset.fiche) { go({ view: 'fiche', fiche: el.dataset.fiche, query: '' }); return; }
  if (el.dataset.appellation) { go({ view: 'appellation', appellation: el.dataset.appellation, query: '' }); return; }
  if (el.dataset.region) { go({ view: 'region', region: el.dataset.region, query: '' }); return; }
  if (el.dataset.nav === 'map') go({ view: 'map', query: '' });
});

input.addEventListener('input', () => { go({ query: input.value }, { replace: true }); });
input.addEventListener('search', () => { go({ query: input.value }, { replace: true }); });
clear.addEventListener('click', () => { input.focus(); go({ query: '' }, { replace: true }); });

window.addEventListener('hashchange', () => {
  readHash();
  render();
  if (!state.query.trim()) view.focus({ preventScroll: true });
});

readHash();
render();
