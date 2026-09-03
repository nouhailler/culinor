/* Terroir de France — application.
 *
 * A faithful implementation of the Claude Design maquette
 * `Terroir de France.dc.html`: the same four views (atlas, région, fiche,
 * recherche), the same derived labels, the same Classical design system.
 * The maquette's runtime is replaced by plain DOM rendering, and the view
 * state is mirrored into the URL hash so every région and every fiche is
 * a shareable address.
 */

import { REGIONS, SPECS, TEASERS, COL, FAM } from './data.js';

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

/* Every fiche, decorated the way the maquette's `specs()` decorates them. */
const ALL = SPECS.map((s) => ({
  ...s,
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
}));

const byId = (id) => ALL.find((s) => s.id === id);

/* ── state, mirrored in the URL hash ─────────────────────────────────── */

const state = { view: 'map', region: null, fiche: null, type: 'Tout', query: '' };

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
  } else {
    state.view = 'map';
  }
}

function hashFor(next = {}) {
  const s = { ...state, ...next };
  let path = '/';
  if (s.view === 'region' && s.region) path = `/region/${s.region}`;
  else if (s.view === 'fiche' && s.fiche) path = `/fiche/${s.fiche}`;

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
  if (!q) return [];
  return ALL.filter((s) => (
    s.n.toLowerCase().includes(q) ||
    s.regionName.toLowerCase().includes(q) ||
    s.t.toLowerCase().includes(q) ||
    s.teaser.toLowerCase().includes(q) ||
    s.ing.some((i) => i.nom.toLowerCase().includes(q))
  ));
}

/* A fiche rendered as a clickable card — shared by the search and région views. */
function specCard(s, { rightSlot, meta, tinted, titleClass }) {
  return `
    <button class="card card-btn" type="button" data-fiche="${esc(s.id)}"
            style="${tinted ? `border-left:3px solid ${s.col};background:${s.tint};` : ''}">
      <span class="card-kicker card-kicker-row" style="color:${s.col}">
        <span>${esc(s.t)}</span><span class="muted">${esc(rightSlot)}</span>
      </span>
      <span class="card-title ${titleClass}">${esc(s.n)}</span>
      <span class="card-body">${esc(s.teaser)}</span>
      <span class="card-meta tnum">${esc(meta)}</span>
    </button>`;
}

function viewSearch() {
  const results = searchResults();
  return `
    <div class="tdf-main-narrow">
      <p class="tdf-kicker">Recherche</p>
      <h1 class="tdf-search-title">${esc(state.query)}</h1>
      <p class="tdf-search-count">${esc(plural(results.length, 'résultat'))}</p>
      <div class="hr" style="margin-bottom:var(--space-6)"></div>
      ${results.length ? `
        <div class="tdf-grid tdf-grid-285">
          ${results.map((s) => specCard(s, {
            rightSlot: s.regionName, meta: `${s.temps} · ${s.diff}`, titleClass: 'card-title-sm',
          })).join('')}
        </div>` : `
        <p class="tdf-empty">Aucune fiche ne correspond à cette recherche. L’inventaire
        porte sur ${ALL.length} spécialités : essayez un nom de région, un type de produit
        (fromage, plat, dessert, charcuterie) ou un ingrédient.</p>`}
    </div>`;
}

function viewMap() {
  const filtered = filteredByType();
  const count = (id) => plural(filtered.filter((s) => s.r === id).length, 'fiche');

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

/* ── render & wiring ─────────────────────────────────────────────────── */

const view = document.getElementById('view');
const input = document.getElementById('q');
const clear = document.getElementById('q-clear');

function render() {
  const searching = !!state.query.trim();
  view.innerHTML = searching ? viewSearch()
    : state.view === 'region' ? viewRegion()
    : state.view === 'fiche' ? viewFiche()
    : viewMap();

  if (input.value !== state.query) input.value = state.query;
  clear.hidden = !state.query;

  document.title = searching
    ? `« ${state.query} » — Terroir de France`
    : state.view === 'fiche' ? `${byId(state.fiche)?.n ?? ''} — Terroir de France`
    : state.view === 'region' ? `${regionName(state.region)} — Terroir de France`
    : 'Terroir de France — Inventaire du patrimoine culinaire';
}

document.getElementById('total-label').textContent = `${ALL.length} fiches · ${REGIONS.length} régions`;

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

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-nav],[data-region],[data-fiche],[data-type]');
  if (!el) return;

  if (el.dataset.type) { go({ type: el.dataset.type }); return; }
  if (el.dataset.fiche) { go({ view: 'fiche', fiche: el.dataset.fiche, query: '' }); return; }
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
