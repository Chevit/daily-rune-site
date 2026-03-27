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
    if (!rune) { console.error(`Unknown rune id: "${runeId}"`); return; }
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
