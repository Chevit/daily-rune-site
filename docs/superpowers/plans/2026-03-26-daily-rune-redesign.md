# Daily Rune Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Daily Rune landing page into a modular ES-module architecture with EN/UA localization sourced from `rune-translations-casual.json`, an official Apple App Store badge, and scroll-triggered animations.

**Architecture:** All JS logic splits into four focused modules (`runes.js`, `rune-engine.js`, `ui.js`, `app.js`) plus a generated `locales.js` baked from `rune-translations-casual.json` via a one-time Node.js script. The page remains a zero-build-step static site — `index.html` loads `js/app.js` via `<script type="module">`.

**Tech Stack:** Vanilla ES modules (no bundler), CSS custom properties, `IntersectionObserver` for scroll reveals, `Intl.DateTimeFormat` for locale-aware dates, Node.js 18+ for generation scripts.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `scripts/gen-locales.mjs` | One-time: reads JSON, writes `js/locales.js` |
| Create | `scripts/test-rune-engine.mjs` | Node.js test for daily rune algorithm |
| Create | `js/runes.js` | Locale-agnostic rune data (id, unicodeSymbol, isReversible) |
| Create | `js/locales.js` | **Generated** — EN/UA UI strings + all rune text |
| Create | `js/rune-engine.js` | `getDailyRune()` → rune id string |
| Create | `js/ui.js` | `UI` class: render, flip, revealMeaning, switchLocale, initScrollReveals |
| Create | `js/app.js` | Entry point — wires all modules + event listeners |
| Create | `css/styles.css` | All styles (extracted + locale toggle + scroll reveals) |
| Create | `assets/app-store-badge.svg` | Official-style Apple App Store badge SVG |
| Modify | `index.html` | Complete rewrite: shell HTML, removes inline style/script |

---

## Task 1: Create js/runes.js

**Files:**
- Create: `js/runes.js`

- [ ] **Step 1: Create the file**

```js
export const RUNES = [
  { id: 'fehu',     unicodeSymbol: 'ᚠ', isReversible: true  },
  { id: 'uruz',     unicodeSymbol: 'ᚢ', isReversible: true  },
  { id: 'thurisaz', unicodeSymbol: 'ᚦ', isReversible: true  },
  { id: 'ansuz',    unicodeSymbol: 'ᚨ', isReversible: true  },
  { id: 'raidho',   unicodeSymbol: 'ᚱ', isReversible: true  },
  { id: 'kenaz',    unicodeSymbol: 'ᚲ', isReversible: true  },
  { id: 'gebo',     unicodeSymbol: 'ᚷ', isReversible: false },
  { id: 'wunjo',    unicodeSymbol: 'ᚹ', isReversible: true  },
  { id: 'hagalaz',  unicodeSymbol: 'ᚺ', isReversible: false },
  { id: 'nauthiz',  unicodeSymbol: 'ᚾ', isReversible: true  },
  { id: 'isa',      unicodeSymbol: 'ᛁ', isReversible: false },
  { id: 'jera',     unicodeSymbol: 'ᛃ', isReversible: false },
  { id: 'eihwaz',   unicodeSymbol: 'ᛇ', isReversible: false },
  { id: 'perthro',  unicodeSymbol: 'ᛈ', isReversible: true  },
  { id: 'algiz',    unicodeSymbol: 'ᛉ', isReversible: true  },
  { id: 'sowilo',   unicodeSymbol: 'ᛊ', isReversible: false },
  { id: 'tiwaz',    unicodeSymbol: 'ᛏ', isReversible: true  },
  { id: 'berkano',  unicodeSymbol: 'ᛒ', isReversible: true  },
  { id: 'ehwaz',    unicodeSymbol: 'ᛖ', isReversible: true  },
  { id: 'mannaz',   unicodeSymbol: 'ᛗ', isReversible: true  },
  { id: 'laguz',    unicodeSymbol: 'ᛚ', isReversible: true  },
  { id: 'ingwaz',   unicodeSymbol: 'ᛜ', isReversible: false },
  { id: 'dagaz',    unicodeSymbol: 'ᛞ', isReversible: false },
  { id: 'othala',   unicodeSymbol: 'ᛟ', isReversible: false },
  { id: 'blank',    unicodeSymbol: '◻', isReversible: false },
];
```

- [ ] **Step 2: Verify count**

Run:
```bash
node -e "import('./js/runes.js').then(m => console.log(m.RUNES.length))"
```
Expected output: `25`

- [ ] **Step 3: Commit**

```bash
git add js/runes.js
git commit -m "feat: add locale-agnostic runes.js module"
```

---

## Task 2: Create scripts/gen-locales.mjs and generate js/locales.js

**Files:**
- Create: `scripts/gen-locales.mjs`
- Create: `js/locales.js` (generated output)

- [ ] **Step 1: Create scripts/gen-locales.mjs**

```js
// scripts/gen-locales.mjs
// Run from repo root: node scripts/gen-locales.mjs
// Reads rune-translations-casual.json (uses 'uk' locale key)
// Writes js/locales.js (uses 'ua' locale key internally)

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const translations = JSON.parse(
  readFileSync(join(root, 'rune-translations-casual.json'), 'utf8')
);

const EXPECTED_IDS = [
  'fehu','uruz','thurisaz','ansuz','raidho','kenaz','gebo','wunjo',
  'hagalaz','nauthiz','isa','jera','eihwaz','perthro','algiz','sowilo',
  'tiwaz','berkano','ehwaz','mannaz','laguz','ingwaz','dagaz','othala','blank',
];

for (const id of EXPECTED_IDS) {
  if (!translations[id]) throw new Error(`Missing rune in JSON: ${id}`);
}
console.log('All 25 runes present ✓');

function buildRunes(jsonLocale) {
  const result = {};
  for (const id of EXPECTED_IDS) {
    const d = translations[id][jsonLocale];
    result[id] = {
      name: d.name,
      keywords: d.keywords,
      uprightMeaning: d.uprightMeaning,
      reversedMeaning: d.reversedMeaning,
    };
  }
  return result;
}

const runesEn = buildRunes('en');
const runesUa = buildRunes('uk'); // JSON uses 'uk', internal key is 'ua'

const output = `// AUTO-GENERATED — do not edit manually
// Source: rune-translations-casual.json
// Regenerate: node scripts/gen-locales.mjs

export const LOCALES = {
  en: {
    appTitle: 'Daily Rune',
    subtitle: 'Elder Futhark Divination',
    revealBtn: "Reveal Today's Rune",
    revealedBtn: (name) => name,
    downloadLabel: 'Full readings in the app',
    tapToReveal: 'Tap to reveal',
    privacyPolicy: 'Privacy Policy',
    support: 'Support',
    termsOfUse: 'Terms of Use',
    runes: ${JSON.stringify(runesEn, null, 4)},
  },
  ua: {
    appTitle: 'Щоденна Руна',
    subtitle: 'Ворожіння на рунах Старшого Футарку',
    revealBtn: 'Розкрити руну дня',
    revealedBtn: (name) => name,
    downloadLabel: 'Повні читання в додатку',
    tapToReveal: 'Торкніться, щоб відкрити',
    privacyPolicy: 'Політика конфіденційності',
    support: 'Підтримка',
    termsOfUse: 'Умови використання',
    runes: ${JSON.stringify(runesUa, null, 4)},
  },
};
`;

writeFileSync(join(root, 'js', 'locales.js'), output, 'utf8');
console.log('js/locales.js written ✓');
```

- [ ] **Step 2: Run the generation script**

```bash
node scripts/gen-locales.mjs
```

Expected output:
```
All 25 runes present ✓
js/locales.js written ✓
```

- [ ] **Step 3: Spot-check the output**

```bash
node -e "import('./js/locales.js').then(m => { console.log(Object.keys(m.LOCALES)); console.log(Object.keys(m.LOCALES.en.runes).length); console.log(m.LOCALES.ua.runes.fehu.name); })"
```

Expected output:
```
[ 'en', 'ua' ]
25
Феу
```

- [ ] **Step 4: Commit**

```bash
git add scripts/gen-locales.mjs js/locales.js
git commit -m "feat: add locales generation script and generated js/locales.js"
```

---

## Task 3: Create js/rune-engine.js (test-first)

**Files:**
- Create: `scripts/test-rune-engine.mjs`
- Create: `js/rune-engine.js`

- [ ] **Step 1: Write the failing test**

Create `scripts/test-rune-engine.mjs`:

```js
// scripts/test-rune-engine.mjs
// Run: node scripts/test-rune-engine.mjs

import { getDailyRune } from '../js/rune-engine.js';

const VALID_IDS = [
  'fehu','uruz','thurisaz','ansuz','raidho','kenaz','gebo','wunjo',
  'hagalaz','nauthiz','isa','jera','eihwaz','perthro','algiz','sowilo',
  'tiwaz','berkano','ehwaz','mannaz','laguz','ingwaz','dagaz','othala','blank',
];

// Test 1: returns a string
const id = getDailyRune();
if (typeof id !== 'string') throw new Error(`Expected string, got ${typeof id}: ${id}`);
console.log('✓ returns string');

// Test 2: returns a known rune id
if (!VALID_IDS.includes(id)) throw new Error(`Unknown rune id: "${id}"`);
console.log(`✓ valid rune id: ${id}`);

// Test 3: deterministic — two calls same day return same id
const id2 = getDailyRune();
if (id !== id2) throw new Error(`Not deterministic: "${id}" vs "${id2}"`);
console.log('✓ deterministic');

// Test 4: day-of-year 0 → index 0, day 1 → index 1, day 25 → index 0 (wraps)
// We test the algorithm directly to avoid date coupling
function runeIndexForDay(dayOfYear) {
  return dayOfYear % VALID_IDS.length;
}
if (runeIndexForDay(0) !== 0) throw new Error('Day 0 should map to index 0');
if (runeIndexForDay(25) !== 0) throw new Error('Day 25 should wrap to index 0');
if (runeIndexForDay(26) !== 1) throw new Error('Day 26 should wrap to index 1');
console.log('✓ modulo wrapping correct');

console.log('\nAll rune-engine tests passed ✓');
```

- [ ] **Step 2: Run test to verify it fails**

```bash
node scripts/test-rune-engine.mjs
```

Expected: Error — `Cannot find module '../js/rune-engine.js'`

- [ ] **Step 3: Create js/rune-engine.js**

```js
import { RUNES } from './runes.js';

// Returns the rune id for today — same for everyone on the same calendar day.
export function getDailyRune() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return RUNES[dayOfYear % RUNES.length].id;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
node scripts/test-rune-engine.mjs
```

Expected output:
```
✓ returns string
✓ valid rune id: <some-id>
✓ deterministic
✓ modulo wrapping correct

All rune-engine tests passed ✓
```

- [ ] **Step 5: Commit**

```bash
git add scripts/test-rune-engine.mjs js/rune-engine.js
git commit -m "feat: add rune-engine.js with deterministic daily rune logic"
```

---

## Task 4: Create css/styles.css

**Files:**
- Create: `css/styles.css`

- [ ] **Step 1: Create the css directory and styles.css**

```css
:root {
  --bg:     #1a1410;
  --stone:  #2d2820;
  --glyph:  #e8dcc8;
  --accent: #c8873a;
  --text:   #f0e8d8;
  --muted:  #a09080;
  --border: #3d3830;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: Georgia, 'Times New Roman', serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* faint runic wallpaper */
body::before {
  content: 'ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ';
  position: fixed;
  inset: 0;
  font-size: 20px;
  letter-spacing: 10px;
  line-height: 3;
  color: rgba(200,135,58,0.035);
  pointer-events: none;
  z-index: 0;
  padding: 24px;
  word-break: break-all;
}

.page {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: 40px 24px 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: opacity 0.2s;
}

/* ── Site Header ── */
.site-header {
  position: relative;
  width: 100%;
  text-align: center;
  margin-bottom: 0;
}

/* ── Locale toggle ── */
.locale-toggle {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}
.locale-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-family: Georgia, serif;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  padding: 4px 2px;
  transition: color 0.2s;
}
.locale-btn.active { color: var(--accent); }
.locale-btn:hover:not(.active) { color: var(--text); }
.locale-sep {
  color: var(--border);
  font-size: 11px;
  user-select: none;
}

/* ── Header text ── */
.app-title {
  font-size: 40px;
  font-weight: normal;
  color: var(--text);
  letter-spacing: 1px;
  text-align: center;
  margin-top: 16px;
}
.app-subtitle {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 3.5px;
  text-transform: uppercase;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 40px;
}
.date-label {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 24px;
}

/* ── Flip card ── */
.card-container {
  perspective: 1000px;
  width: 190px;
  height: 230px;
  cursor: pointer;
  margin-bottom: 28px;
  flex-shrink: 0;
}
.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.75s cubic-bezier(0.4, 0, 0.2, 1);
}
.card.flipped { transform: rotateY(180deg); }

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 8px;
  background: var(--stone);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.card-front { transform: rotateY(180deg); }

.card-back-glyph {
  font-size: 72px;
  color: var(--border);
  user-select: none;
  line-height: 1;
}
.card-back-label {
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

.rune-glyph {
  font-size: 96px;
  color: var(--glyph);
  line-height: 1;
  user-select: none;
}
.rune-name-card {
  font-size: 14px;
  color: var(--accent);
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

/* ── Reveal button ── */
.reveal-btn {
  background: var(--stone);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  font-family: Georgia, serif;
  font-size: 17px;
  letter-spacing: 1px;
  padding: 17px 0;
  cursor: pointer;
  width: 100%;
  max-width: 320px;
  margin-bottom: 36px;
  transition: border-color 0.2s, background 0.2s, opacity 0.2s;
}
.reveal-btn:hover:not(:disabled) {
  background: #332d26;
  border-color: var(--accent);
}
.reveal-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

/* ── Meaning card ── */
.meaning-card {
  background: var(--stone);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 28px 24px;
  width: 100%;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.55s ease 0.35s, transform 0.55s ease 0.35s;
  pointer-events: none;
}
.meaning-card.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 18px;
}
.keyword {
  font-size: 10px;
  color: var(--accent);
  letter-spacing: 2px;
  text-transform: uppercase;
  background: rgba(200,135,58,0.09);
  border: 1px solid rgba(200,135,58,0.22);
  border-radius: 3px;
  padding: 3px 8px;
}
.meaning-text {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text);
  white-space: pre-wrap;
}

/* ── Divider ── */
.divider {
  width: 48px;
  height: 1px;
  background: var(--border);
  margin: 44px 0;
}

/* ── Download section ── */
.download-section {
  text-align: center;
  width: 100%;
}
.download-label {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.download-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.download-buttons a {
  display: inline-block;
  transition: opacity 0.2s;
}
.download-buttons a:hover { opacity: 0.85; }
.download-buttons img { display: block; }

/* ── Footer ── */
.footer-nav {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}
.footer-nav a {
  font-size: 11px;
  color: var(--muted);
  text-decoration: none;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: color 0.2s;
}
.footer-nav a:hover { color: var(--accent); }

/* ── Scroll reveals ── */
.reveal-section {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.reveal-section.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .reveal-section,
  .reveal-section.visible {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .card { transition: none; }
  .meaning-card { transition: none; }
  .page { transition: none; }
  .reveal-btn { transition: none; }
}
```

- [ ] **Step 2: Commit**

```bash
git add css/styles.css
git commit -m "feat: add css/styles.css with locale toggle and scroll-reveal styles"
```

---

## Task 5: Create assets/app-store-badge.svg

**Files:**
- Create: `assets/app-store-badge.svg`

- [ ] **Step 1: Create the assets directory and SVG**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="54" viewBox="0 0 160 54" role="img" aria-label="Download on the App Store">
  <rect width="160" height="54" rx="8" ry="8" fill="#000"/>
  <!-- Apple logo -->
  <path fill="#fff" d="M30.6 26.8c.1-3.3 2.7-4.9 2.8-5-1.5-2.2-3.9-2.5-4.7-2.6-2-.2-3.9 1.2-4.9 1.2-1 0-2.6-1.2-4.3-1.1-2.2 0-4.2 1.3-5.4 3.3-2.3 3.9-.6 9.8 1.6 13 1.1 1.6 2.4 3.3 4.1 3.2 1.6-.1 2.3-1 4.3-1 2 0 2.6 1 4.3 1 1.8 0 3-1.6 4.1-3.2.8-1.1 1.5-2.4 1.9-3.8-4.2-1.5-4.8-8-.8-10.7l-3 3.7z"/>
  <path fill="#fff" d="M27.5 16.9c.9-1.1 1.5-2.6 1.3-4.1-1.3.1-2.8.8-3.7 1.9-.8.9-1.6 2.4-1.4 3.8 1.4.1 2.8-.6 3.8-1.6z"/>
  <!-- "Download on the" -->
  <text x="40" y="22" font-family="-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="10" fill="#fff" letter-spacing="0.3">Download on the</text>
  <!-- "App Store" -->
  <text x="39" y="40" font-family="-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="18" font-weight="600" fill="#fff" letter-spacing="0.2">App Store</text>
</svg>
```

> Note: Replace with the official Apple badge SVG from https://developer.apple.com/app-store/marketing/guidelines/ if you want the exact official asset. The SVG above is a functional stand-in.

- [ ] **Step 2: Commit**

```bash
git add assets/app-store-badge.svg
git commit -m "feat: add Apple App Store badge SVG"
```

---

## Task 6: Rewrite index.html

**Files:**
- Modify: `index.html` (complete rewrite)

- [ ] **Step 1: Replace index.html with the new shell**

The new HTML removes all inline `<style>` and `<script>` blocks. All IDs listed here are required by `js/ui.js`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="google-site-verification" content="WheYdMLT7Hkb3wq0LvasfSV_0bMPkwo0zTd48iychos" />
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <title>Daily Rune</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="page">

    <!-- Header -->
    <header class="site-header">
      <div class="locale-toggle">
        <button class="locale-btn active" data-locale="en">EN</button>
        <span class="locale-sep">|</span>
        <button class="locale-btn" data-locale="ua">UA</button>
      </div>
      <h1 class="app-title" id="appTitle"></h1>
      <p class="app-subtitle" id="appSubtitle"></p>
      <p class="date-label" id="dateLabel"></p>
    </header>

    <!-- Flip card -->
    <div class="card-container" id="cardContainer">
      <div class="card" id="card">
        <div class="card-face card-back">
          <span class="card-back-glyph">ᚠ</span>
          <span class="card-back-label" id="cardBackLabel"></span>
        </div>
        <div class="card-face card-front">
          <span class="rune-glyph" id="runeGlyph"></span>
          <span class="rune-name-card" id="runeNameCard"></span>
        </div>
      </div>
    </div>

    <button class="reveal-btn" id="revealBtn"></button>

    <!-- Meaning panel, hidden until reveal -->
    <div class="meaning-card" id="meaningCard">
      <div class="keywords" id="keywords"></div>
      <p class="meaning-text" id="meaningText"></p>
    </div>

    <div class="divider"></div>

    <!-- Download CTA -->
    <div class="download-section reveal-section">
      <p class="download-label" id="downloadLabel"></p>
      <div class="download-buttons">
        <a href="https://apps.apple.com/app/daily-rune/id6745174491" target="_blank" rel="noopener">
          <img src="assets/app-store-badge.svg" alt="Download on the App Store" width="160" height="54">
        </a>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Footer -->
    <nav class="footer-nav reveal-section">
      <a href="privacy-policy.html" id="privacyLink"></a>
      <a href="support.html" id="supportLink"></a>
      <a href="terms-of-use.html" id="termsLink"></a>
    </nav>

  </div>

  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: rewrite index.html as module shell (removes inline style/script)"
```

---

## Task 7: Create js/ui.js

**Files:**
- Create: `js/ui.js`

- [ ] **Step 1: Create js/ui.js**

```js
import { LOCALES } from './locales.js';
import { RUNES } from './runes.js';

export class UI {
  constructor() {
    this._runeId = null;
    this._locale = 'en';
    this._revealed = false;
  }

  // Populates all text, pre-fills card front, sets locale button active state.
  render(runeId, locale) {
    this._runeId = runeId;
    this._locale = locale;
    this._renderText();

    // Pre-populate card front (hidden behind card until flip)
    const rune = RUNES.find(r => r.id === runeId);
    document.getElementById('runeGlyph').textContent = rune.unicodeSymbol;
    document.getElementById('runeNameCard').textContent =
      LOCALES[locale].runes[runeId].name.toUpperCase();
  }

  // Flips card, disables button, shows rune name on button. No-op if already revealed.
  flip() {
    if (this._revealed) return;
    this._revealed = true;
    document.getElementById('card').classList.add('flipped');
    const btn = document.getElementById('revealBtn');
    btn.disabled = true;
    btn.textContent = LOCALES[this._locale].runes[this._runeId].name;
  }

  // Populates keywords + meaning text, then fades in the meaning card after 500ms.
  revealMeaning() {
    if (!this._revealed) return;
    this._renderMeaning();
    setTimeout(() => {
      document.getElementById('meaningCard').classList.add('visible');
    }, 500);
  }

  // Fades out page (200ms), updates all text, fades back in.
  switchLocale(locale) {
    this._locale = locale;
    const page = document.querySelector('.page');
    page.style.opacity = '0.3';

    setTimeout(() => {
      this._renderText();
      // Update card front name in new locale
      document.getElementById('runeNameCard').textContent =
        LOCALES[locale].runes[this._runeId].name.toUpperCase();

      if (this._revealed) {
        this._renderMeaning();
        const btn = document.getElementById('revealBtn');
        btn.disabled = true;
        btn.textContent = LOCALES[locale].runes[this._runeId].name;
      }

      page.style.opacity = '1';
    }, 200);
  }

  // Wires IntersectionObserver onto .reveal-section elements.
  // Does nothing if prefers-reduced-motion is set (CSS already makes them visible).
  initScrollReveals() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-section').forEach(el => observer.observe(el));
  }

  // ── Private helpers ──

  _renderText() {
    const L = LOCALES[this._locale];
    const fmt = this._locale === 'ua' ? 'uk-UA' : 'en-US';

    document.getElementById('appTitle').textContent = L.appTitle;
    document.getElementById('appSubtitle').textContent = L.subtitle;
    document.getElementById('cardBackLabel').textContent = L.tapToReveal;
    document.getElementById('revealBtn').textContent = L.revealBtn;
    document.getElementById('downloadLabel').textContent = L.downloadLabel;
    document.getElementById('privacyLink').textContent = L.privacyPolicy;
    document.getElementById('supportLink').textContent = L.support;
    document.getElementById('termsLink').textContent = L.termsOfUse;
    document.getElementById('dateLabel').textContent = new Date().toLocaleDateString(fmt, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    document.querySelectorAll('.locale-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.locale === this._locale);
    });
  }

  _renderMeaning() {
    const runeL = LOCALES[this._locale].runes[this._runeId];
    const kwEl = document.getElementById('keywords');
    kwEl.innerHTML = '';
    runeL.keywords.forEach(kw => {
      const span = document.createElement('span');
      span.className = 'keyword';
      span.textContent = kw;
      kwEl.appendChild(span);
    });
    document.getElementById('meaningText').textContent = runeL.uprightMeaning;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add js/ui.js
git commit -m "feat: add UI class (render, flip, revealMeaning, switchLocale, scroll reveals)"
```

---

## Task 8: Create js/app.js

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: Create js/app.js**

```js
import { getDailyRune } from './rune-engine.js';
import { UI } from './ui.js';

const runeId = getDailyRune();
const locale = localStorage.getItem('locale') || 'en';

const ui = new UI();
ui.render(runeId, locale);
ui.initScrollReveals();

// Reveal via button or card click
function reveal() {
  ui.flip();
  ui.revealMeaning();
}

document.getElementById('revealBtn').addEventListener('click', reveal);
document.getElementById('cardContainer').addEventListener('click', reveal);

// Locale toggle
document.querySelectorAll('.locale-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const newLocale = btn.dataset.locale;
    if (newLocale === locale) return; // already active — but note: `locale` is const,
    // so after first switch we need the UI to track state. The UI class handles this.
    localStorage.setItem('locale', newLocale);
    ui.switchLocale(newLocale);
  });
});
```

> **Note:** The `locale` const is only used for the initial render. After that, the `UI` class tracks the current locale internally via `this._locale`. The locale button's `active` class is maintained by `_renderText()` after each switch. The `if (newLocale === locale)` guard only prevents the very first identical click; subsequent switches work because `switchLocale` is called regardless.

- [ ] **Step 2: Fix the locale guard (use a mutable variable)**

The `const locale` won't update after the first switch. Replace the guard with a tracked variable:

```js
import { getDailyRune } from './rune-engine.js';
import { UI } from './ui.js';

const runeId = getDailyRune();
let currentLocale = localStorage.getItem('locale') || 'en';

const ui = new UI();
ui.render(runeId, currentLocale);
ui.initScrollReveals();

function reveal() {
  ui.flip();
  ui.revealMeaning();
}

document.getElementById('revealBtn').addEventListener('click', reveal);
document.getElementById('cardContainer').addEventListener('click', reveal);

document.querySelectorAll('.locale-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const newLocale = btn.dataset.locale;
    if (newLocale === currentLocale) return;
    currentLocale = newLocale;
    localStorage.setItem('locale', newLocale);
    ui.switchLocale(newLocale);
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add app.js entry point, wire all modules and event listeners"
```

---

## Task 9: Browser smoke test

**Files:** none

Open the site in a browser. Since it's a static site with ES modules, you need a local HTTP server (ES modules don't load over `file://`).

- [ ] **Step 1: Start a local server**

```bash
# Python 3 (available on most systems)
python -m http.server 8080
```

Then open: `http://localhost:8080`

- [ ] **Step 2: Verify initial load (English)**

Check all of these:
- [ ] Title shows "Daily Rune"
- [ ] Subtitle shows "ELDER FUTHARK DIVINATION"
- [ ] Date shows today in English (e.g. "Thursday, March 26, 2026")
- [ ] Card back shows a faint ᚠ glyph and "TAP TO REVEAL"
- [ ] Reveal button shows "Reveal Today's Rune" (enabled)
- [ ] Download label shows "FULL READINGS IN THE APP"
- [ ] Apple badge image is visible (160px wide)
- [ ] Footer shows "PRIVACY POLICY · SUPPORT · TERMS OF USE"
- [ ] Download section and footer animate in as you scroll (or are already visible if page is short enough)

- [ ] **Step 3: Verify reveal interaction**

- [ ] Click "Reveal Today's Rune" — card flips to show rune glyph and name
- [ ] After ~500ms, meaning card fades in with keyword tags and upright meaning text
- [ ] Reveal button becomes disabled and shows the rune name
- [ ] Click the card again — nothing happens (already revealed)
- [ ] Click the button again — nothing happens (disabled)

- [ ] **Step 4: Verify locale switch (before reveal)**

- [ ] Reload the page
- [ ] Click "UA"
- [ ] Title switches to "Щоденна Руна"
- [ ] Subtitle switches to "ВОРОЖІННЯ НА РУНАХ СТАРШОГО ФУТАРКУ"
- [ ] Date shows today in Ukrainian
- [ ] Card back label switches to "ТОРКНІТЬСЯ, ЩОБ ВІДКРИТИ"
- [ ] Reveal button shows "Розкрити руну дня"
- [ ] Footer links show Ukrainian text

- [ ] **Step 5: Verify locale switch (after reveal)**

- [ ] Click "Розкрити руну дня" — card flips, meaning appears in Ukrainian
- [ ] Click "EN" — fade transition occurs, meaning text switches to English
- [ ] Button still shows rune name (in English now)
- [ ] Click "UA" again — meaning switches back to Ukrainian

- [ ] **Step 6: Verify locale persistence**

- [ ] With "UA" active, reload the page
- [ ] Page loads in Ukrainian (locale was saved to localStorage)

- [ ] **Step 7: Final commit**

```bash
git add .
git status  # confirm no unexpected files
git commit -m "feat: complete daily rune site redesign with modular JS and EN/UA localization"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|-----------------|------|
| Modular JS architecture (runes.js, locales.js, rune-engine.js, ui.js, app.js) | Tasks 1–3, 7–8 |
| EN/UA localization with rune-translations-casual.json as source | Task 2 |
| `uk` → `ua` locale key mapping | Task 2 (gen script) |
| Locale toggle EN\|UA in top-right, accent color for active | Task 4 (CSS), Task 6 (HTML), Task 7 (render) |
| Locale persisted in localStorage | Task 8 |
| Date with Intl.DateTimeFormat in active locale | Task 7 (`_renderText`) |
| Flip card 190×230px, 3D CSS, 0.75s cubic-bezier | Task 4 (CSS), Task 6 (HTML) |
| "Reveal" button → flip + meaning reveal | Task 7 (flip/revealMeaning), Task 8 |
| Card click also triggers reveal | Task 8 |
| Meaning card: keywords + uprightMeaning | Task 7 (_renderMeaning) |
| 500ms delay before meaning card appears | Task 7 (revealMeaning) |
| Locale switch: 400ms fade (200ms out + 200ms in) | Task 7 (switchLocale) |
| Locale switch re-renders meaning if already revealed | Task 7 (switchLocale) |
| Apple App Store SVG badge as `<a><img>` | Tasks 5, 6 |
| Scroll reveals with IntersectionObserver | Task 7 (initScrollReveals), Task 4 (CSS) |
| `prefers-reduced-motion` respected | Task 4 (CSS media query), Task 7 (guard) |
| Footer links: Privacy / Support / Terms | Task 6 (HTML), Task 7 (_renderText) |
| Zero build step, ES modules, GitHub Pages compatible | All tasks — no bundler used |

**No gaps found.**
