# Daily Rune Subpages Restyle — Design Document
_2026-03-27_

## Overview

Restyle `privacy-policy.html`, `support.html`, and `terms-of-use.html` to match the dark runic theme and modular architecture of the redesigned `index.html`. Add a shared `js/page-locale.js` module that reads locale from a `?locale=` query parameter, persists it to `localStorage`, and wires the `EN | UA` toggle — keeping locale in sync across all pages.

The pages remain zero-build-step static files deployable directly to GitHub Pages.

---

## File Structure

```
daily-rune-site/
├── css/
│   └── styles.css                  ← shared dark theme (unchanged)
├── js/
│   ├── page-locale.js              ← NEW: shared locale module for subpages
│   ├── runes.js                    ← unchanged
│   ├── locales.js                  ← unchanged
│   ├── rune-engine.js              ← unchanged
│   ├── ui.js                       ← unchanged
│   └── app.js                      ← unchanged
├── index.html                      ← footer links updated (new tab + locale param)
├── privacy-policy.html             ← restyled
├── support.html                    ← restyled
└── terms-of-use.html               ← restyled
```

---

## `js/page-locale.js`

Shared ES module loaded by all three subpages.

**Responsibilities:**
1. Read locale on load: `?locale=` query param → `localStorage.getItem('locale')` → `'en'`
2. Save locale to `localStorage` on change (syncs with `index.html`)
3. Apply locale: show `[data-lang="<locale>"]` elements, hide others
4. Wire `EN | UA` toggle: update `.locale-btn.active` class, re-apply locale on click

**Exports:** nothing (side-effect module — call once on page load).

```js
// Locale priority: query param → localStorage → 'en'
const params = new URLSearchParams(window.location.search);
const initial = params.get('locale') || localStorage.getItem('locale') || 'en';
```

---

## Subpage Structure

Each of the three pages gets an identical structural treatment:

### Head
- `<link rel="stylesheet" href="css/styles.css">`
- `<script type="module" src="js/page-locale.js">`
- Remove all inline `<style>` blocks

### Body
- `.page` wrapper (same as `index.html`)
- `.site-header` with:
  - `EN | UA` locale toggle (same markup as `index.html`)
  - Page title as `.app-title`
  - Back link: small muted `← Daily Rune` link to `index.html`, positioned below title
- Content wrapped in a `.meaning-card` container (stone background, border-radius, padding)
- `.divider` between header and content
- All inline `<script>` blocks removed

### Locale content
- All `data-lang="uk"` attributes changed to `data-lang="ua"`
- Content structure preserved — bilingual divs shown/hidden by `page-locale.js`

---

## `index.html` Changes

Footer links updated to:
1. Open in a new tab: `target="_blank" rel="noopener"`
2. Pass the current locale as a query param so the opened tab inherits it

The locale is appended dynamically in `js/app.js` after the locale buttons are wired — or as a one-time DOM update on load.

Specifically, `app.js` is updated to set footer link hrefs on load and on locale switch:

```js
function updateFooterLinks(locale) {
  ['privacyLink', 'supportLink', 'termsLink'].forEach(id => {
    const el = document.getElementById(id);
    const base = el.getAttribute('data-href');
    el.href = `${base}?locale=${locale}`;
  });
}
```

`index.html` footer anchors get `data-href` with the base path, `target="_blank" rel="noopener"`, and empty `href` (filled by JS on load).

---

## Locale Behavior

| Trigger | Behavior |
|---------|----------|
| `?locale=ua` in URL | Opens page in UA locale |
| `?locale=en` in URL | Opens page in EN locale |
| No query param | Falls back to `localStorage` value, then `'en'` |
| Toggle click | Updates display, saves to `localStorage` |
| Saved locale | Carried back to `index.html` on next visit |

---

## Color Palette / CSS

No new CSS variables or classes needed. Subpages reuse:
- `.page`, `.site-header`, `.locale-toggle`, `.locale-btn`, `.locale-sep` — layout and toggle
- `.app-title` — page heading
- `.meaning-card` — content container
- `.footer-nav` — not reused on subpages (no footer nav needed)
- `.divider` — horizontal rule between header and content

One addition to `css/styles.css`: a `.back-link` style for the `← Daily Rune` navigation link:

```css
.back-link {
  font-size: 11px;
  color: var(--muted);
  text-decoration: none;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: color 0.2s;
  display: block;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 40px;
}
.back-link:hover { color: var(--accent); }
```

---

## Out of Scope

- Translating content of subpages (existing bilingual content is preserved as-is)
- Adding new legal/support content
- Scroll-reveal animations on subpages (long-form content, not needed)
- Google Play button or other app store changes
