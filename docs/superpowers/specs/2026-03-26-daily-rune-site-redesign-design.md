# Daily Rune Site — Redesign Design Document
_2026-03-26_

## Overview

Redesign the Daily Rune landing page (`daily-rune-site`) to use a multi-file modular JS architecture, add EN/UA localization (including full rune meaning translations), upgrade the App Store button to the official Apple badge, and add scroll-triggered animations and a locale-switch fade transition.

The page remains a zero-build-step static site deployable directly to GitHub Pages.

---

## File Structure

```
daily-rune-site/
├── index.html                          ← shell, loads CSS + JS modules
├── css/
│   └── styles.css                      ← existing styles + scroll-reveal + locale toggle
├── js/
│   ├── runes.js                        ← rune data (from runes.ts, plain JS export)
│   ├── locales.js                      ← en/ua UI strings + all rune meanings translated
│   ├── rune-engine.js                  ← deterministic daily rune logic
│   ├── ui.js                           ← DOM rendering, flip card, scroll reveals, locale fade
│   └── app.js                          ← entry point, wires modules together
├── assets/
│   └── app-store-badge.svg             ← official Apple "Download on the App Store" badge
├── favicon.ico
├── privacy-policy.html
├── terms-of-use.html
├── support.html
├── app-ads.txt
├── googleccc06d6b9facf623.html
└── CNAME
```

`index.html` loads `js/app.js` via `<script type="module">`. All JS files use ES module `import/export`. No bundler required.

---

## Page Layout

Four sections, top to bottom:

### 1. Header
- App title: "Daily Rune" / "Щоденна Руна"
- Subtitle: "Elder Futhark Divination" / "Ворожіння на рунах Старшого Футарку"
- Locale toggle `EN | UA` in the top-right corner. Active locale highlighted in `--accent` color.
- Today's date formatted with `Intl.DateTimeFormat` in the active locale (`en-US` / `uk-UA`)

### 2. Daily Rune (hero interaction)
- Flip card (3D CSS, 190×230px) — back face shows placeholder glyph, front face shows today's rune glyph + name
- "Reveal Today's Rune" / "Розкрити руну дня" button below the card
- After reveal: card flips, button becomes disabled and shows the rune name, meaning card slides up + fades in
- Meaning card contains: keyword tags + full `uprightMeaning` text in the active locale

### 3. Download CTA
- Thin divider
- Label: "Full readings in the app" / "Повні читання в додатку"
- Official Apple "Download on the App Store" SVG badge, linking to `https://apps.apple.com/app/daily-rune/id6745174491`
- No Google Play button for now (placeholder-ready for later)

### 4. Footer
- Links: Privacy Policy / Support / Terms of Use (same as current)

---

## Modules

### `js/runes.js`
Rune data copied from `runes.ts`, converted to plain JS (`export const RUNES = [...]`). Contains all 25 Elder Futhark runes with fields: `id`, `name`, `unicodeSymbol`, `keywords`, `isReversible`, `uprightMeaning`, `reversedMeaning`. This is the canonical source used by `rune-engine.js` for the daily rune selection logic.

### `js/locales.js`
Exports `LOCALES` object:
```js
export const LOCALES = {
  en: {
    appTitle: 'Daily Rune',
    subtitle: 'Elder Futhark Divination',
    revealBtn: "Reveal Today's Rune",
    revealedBtn: (name) => name,         // rune name after reveal
    downloadLabel: 'Full readings in the app',
    tapToReveal: 'Tap to reveal',
    privacyPolicy: 'Privacy Policy',
    support: 'Support',
    termsOfUse: 'Terms of Use',
    runes: {
      fehu: {
        name: 'Fehu',
        keywords: ['abundance', 'wealth', 'fertility', 'new beginnings'],
        uprightMeaning: '...',
        reversedMeaning: '...',
      },
      // ... all 25 runes
    }
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
    runes: {
      fehu: {
        name: 'Фехо',
        keywords: ['достаток', 'багатство', 'родючість', 'новий початок'],
        uprightMeaning: '...',   // full Ukrainian translation
        reversedMeaning: '...',
      },
      // ... all 25 runes
    }
  }
}
```

### `js/rune-engine.js`
Locale-agnostic. Exports `getDailyRune()` which returns a rune `id` (string) based on a deterministic day-of-year calculation (same algorithm as current site). The UI layer resolves display text from `LOCALES[locale].runes[id]`.

### `js/ui.js`
Exports a `UI` class. Responsibilities:
- `render(runeId, locale)` — populates all text nodes, date label, keywords, meaning
- `flip()` — triggers card flip CSS class
- `revealMeaning()` — adds `.visible` to meaning card after 500ms delay
- `switchLocale(locale)` — fade out (200ms) → update all text → fade in (200ms); if rune already revealed, re-renders meaning in new locale
- `initScrollReveals()` — sets up `IntersectionObserver` on `.reveal-section` elements; adds `.visible` class when in viewport; respects `prefers-reduced-motion`

### `js/app.js`
Entry point:
1. Reads locale from `localStorage` (default `'en'`)
2. Calls `getDailyRune()` to get today's rune id
3. Instantiates `UI`, calls `render(runeId, locale)`
4. Calls `ui.initScrollReveals()`
5. Wires reveal button + card click → `ui.flip()` + `ui.revealMeaning()`
6. Wires locale toggle → `ui.switchLocale()` + saves to `localStorage`

---

## Localization

- Locale persisted in `localStorage` key `'locale'`
- Default: `'en'`
- Locale switch triggers a 400ms total fade transition (200ms out + 200ms in)
- Date formatted with `Intl.DateTimeFormat(locale === 'ua' ? 'uk-UA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })`
- All 25 rune meanings translated into Ukrainian in `locales.js`

---

## Animations

| Animation | Trigger | Implementation |
|-----------|---------|----------------|
| Flip card | Button click / card click | CSS `rotateY(180deg)`, 0.75s cubic-bezier |
| Meaning card reveal | 500ms after flip | CSS `opacity` + `translateY`, 0.55s ease |
| Locale switch | Toggle click | JS sets `opacity: 0.3` → text update → `opacity: 1` |
| Scroll reveals | Section enters viewport | `IntersectionObserver` adds `.visible` class |
| Reduced motion | `prefers-reduced-motion: reduce` | Scroll reveals disabled; transitions set to 0ms |

Scroll-reveal sections start with `opacity: 0; transform: translateY(16px)` and transition to `opacity: 1; transform: translateY(0)` over 0.5s when `.visible` is added.

---

## Store Button

- Single Apple "Download on the App Store" official SVG badge in `assets/app-store-badge.svg`
- Links to `https://apps.apple.com/app/daily-rune/id6745174491`
- Displayed as `<a><img></a>`, not styled as a text button
- Width: 160px, centered
- Google Play: not included now; structure allows adding a second badge later

---

## Color Palette (unchanged)

```css
--bg:     #1a1410;
--stone:  #2d2820;
--glyph:  #e8dcc8;
--accent: #c8873a;
--text:   #f0e8d8;
--muted:  #a09080;
--border: #3d3830;
```

---

## Out of Scope

- Build tooling (Vite, webpack, etc.)
- Google Play button
- Reversed rune display (site shows upright only, same as current)
- Additional spreads or features from the app
