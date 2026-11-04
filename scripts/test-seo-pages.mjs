// scripts/test-seo-pages.mjs
// Run: node scripts/test-seo-pages.mjs
// Checks the static SEO pages written by scripts/gen-seo-pages.mjs and both homepages.

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { LOCALES } from '../js/locales.js';
import { RUNES } from '../js/runes.js';
import { UK_SEARCH_NAMES } from './gen-seo-pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://dailyrune.app';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function read(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) throw new Error(`Missing file: ${rel}`);
  return readFileSync(p, 'utf8');
}
function check(cond, msg) { if (!cond) throw new Error(msg); }
function attr(html, re, what, file) {
  const m = html.match(re);
  check(m, `${file}: missing ${what}`);
  return m[1];
}

// Shared <head> checks; returns parsed JSON-LD.
function checkHead(html, file, { lang, url, enUrl, ukUrl }) {
  check(html.includes(`<html lang="${lang}">`), `${file}: expected <html lang="${lang}">`);
  check(/^<!DOCTYPE html>[\s\S]*?<head>\s*<meta charset="UTF-8">/.test(html.replace(/^<!--.*?-->\n/, '')), `${file}: <meta charset> must be first in <head>`);
  const title = attr(html, /<title>([^<]*)<\/title>/, '<title>', file);
  const desc = attr(html, /<meta name="description" content="([^"]*)">/, 'meta description', file);
  check(desc.length >= 70 && desc.length <= 160, `${file}: description length ${desc.length} not in 70–160`);
  check(attr(html, /<link rel="canonical" href="([^"]*)">/, 'canonical', file) === url, `${file}: canonical should be ${url}`);
  for (const [hl, href] of [['en', enUrl], ['uk', ukUrl], ['x-default', enUrl]]) {
    check(html.includes(`<link rel="alternate" hreflang="${hl}" href="${href}">`), `${file}: missing hreflang ${hl} → ${href}`);
  }
  for (const p of ['og:type', 'og:title', 'og:description', 'og:site_name', 'og:locale', 'og:locale:alternate']) {
    check(html.includes(`<meta property="${p}" content="`), `${file}: missing ${p}`);
  }
  check(html.includes(`<meta property="og:url" content="${url}">`), `${file}: og:url should be ${url}`);
  check(html.includes('<meta name="twitter:card" content="summary_large_image">'), `${file}: twitter:card should be summary_large_image`);
  check(html.includes('<meta property="og:image" content="https://dailyrune.app/assets/og-image.png">'), `${file}: missing og:image`);
  const alt = lang === 'uk' ? 'Сяюча руна Альгіз — Щоденна Руна' : 'Glowing Algiz rune — Daily Rune';
  check(html.includes(`<meta property="og:image:alt" content="${alt}">`), `${file}: og:image:alt should be "${alt}"`);
  const ld = attr(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/, 'JSON-LD', file);
  return { title, desc, ld: JSON.parse(ld) };
}

function h1s(html) { return [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map(m => m[1].trim()); }

const LOC = {
  en: { lang: 'en', prefix: '' },
  ua: { lang: 'uk', prefix: '/uk' },
};
const urlFor = (l, path) => `${SITE}${LOC[l].prefix}${path}`;

// ── Rune pages ──
for (const rune of RUNES) {
  for (const l of ['en', 'ua']) {
    const file = `${l === 'ua' ? 'uk/' : ''}runes/${rune.id}/index.html`;
    const html = read(file);
    const R = LOCALES[l].runes[rune.id];
    const { title, desc, ld } = checkHead(html, file, {
      lang: LOC[l].lang,
      url: urlFor(l, `/runes/${rune.id}/`),
      enUrl: urlFor('en', `/runes/${rune.id}/`),
      ukUrl: urlFor('ua', `/runes/${rune.id}/`),
    });

    const h = h1s(html);
    check(h.length === 1, `${file}: expected exactly one <h1>, got ${h.length}`);
    check(h[0].includes(esc(R.name)), `${file}: <h1> should contain "${R.name}"`);

    check(desc.length >= 90 && desc.length <= 160, `${file}: rune description length ${desc.length} not in 90–160`);
    const names = l === 'ua' && UK_SEARCH_NAMES[rune.id] ? [UK_SEARCH_NAMES[rune.id], R.name] : [R.name];
    for (const n of names) {
      check(h[0].includes(esc(n)), `${file}: <h1> should contain "${n}"`);
      if (!(rune.id === 'blank' && l === 'en')) check(title.includes(esc(n)), `${file}: title should contain "${n}"`);
    }

    check(title.length >= 29 && title.length <= 65, `${file}: title length ${title.length} not in 29–65`);
    const titleName = rune.id === 'blank' && l === 'en' ? 'Blank Rune (Odin)' : R.name;
    check(title.includes(esc(titleName)), `${file}: title should contain "${titleName}"`);

    for (const p of R.uprightMeaning.split('\n\n')) check(html.includes(esc(p)), `${file}: upright paragraph missing: ${p.slice(0, 40)}…`);
    const hasReversed = html.includes('id="reversed"');
    check(hasReversed === rune.isReversible, `${file}: reversed section present=${hasReversed}, isReversible=${rune.isReversible}`);
    if (rune.isReversible) {
      for (const p of R.reversedMeaning.split('\n\n')) check(html.includes(esc(p)), `${file}: reversed paragraph missing: ${p.slice(0, 40)}…`);
    }

    check(html.includes(rune.unicodeSymbol), `${file}: missing glyph`);
    check(html.includes('href="https://apps.apple.com/app/daily-rune/id1500635349"'), `${file}: missing App Store badge`);
    check(html.includes('href="https://play.google.com/store/apps/details?id=com.che.vit.runecast&amp;referrer=utm_source%3Ddaily-rune-site%26utm_medium%3Dweb"'), `${file}: missing Play badge`);
    check(html.includes(`href="${LOC[l].prefix}/runes/"`), `${file}: missing hub link`);
    const other = l === 'en' ? 'ua' : 'en';
    check(html.includes(`href="${LOC[other].prefix}/runes/${rune.id}/"`), `${file}: missing other-language link`);

    check(ld['@type'] === 'Article', `${file}: JSON-LD @type should be Article`);
    check(ld.inLanguage === LOC[l].lang, `${file}: JSON-LD inLanguage should be ${LOC[l].lang}`);
    const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map(m => m[1]);
    check(scripts.every(a => a.includes('application/ld+json')), `${file}: only JSON-LD scripts allowed`);
  }
}
console.log('✓ rune pages (25 × 2)');

// ── Hub pages ──
for (const l of ['en', 'ua']) {
  const file = l === 'en' ? 'runes/index.html' : 'uk/runes/index.html';
  const html = read(file);
  const { ld } = checkHead(html, file, {
    lang: LOC[l].lang, url: urlFor(l, '/runes/'), enUrl: urlFor('en', '/runes/'), ukUrl: urlFor('ua', '/runes/'),
  });
  check(h1s(html).length === 1, `${file}: expected exactly one <h1>`);
  check(ld['@type'] === 'CollectionPage', `${file}: JSON-LD @type should be CollectionPage`);
  for (const r of RUNES) check(html.includes(`href="${LOC[l].prefix}/runes/${r.id}/"`), `${file}: missing link to ${r.id}`);
}
console.log('✓ hub pages');

// ── Homepages ──
for (const l of ['en', 'ua']) {
  const file = l === 'en' ? 'index.html' : 'uk/index.html';
  const html = read(file);
  const { ld } = checkHead(html, file, {
    lang: LOC[l].lang, url: urlFor(l, '/'), enUrl: urlFor('en', '/'), ukUrl: urlFor('ua', '/'),
  });
  const h = h1s(html);
  check(h.length === 1 && h[0].replace(/<[^>]*>/g, '').trim(), `${file}: expected one non-empty static <h1>`);
  const types = (ld['@graph'] || []).map(n => n['@type']);
  check(types.includes('WebSite') && types.includes('MobileApplication'), `${file}: JSON-LD @graph needs WebSite + MobileApplication`);
}
console.log('✓ homepages');

// ── sitemap.xml + robots.txt ──
const sitemap = read('sitemap.xml');
const expected = ['/', '/uk/', '/runes/', '/uk/runes/', '/support.html', '/privacy-policy.html', '/terms-of-use.html',
  ...RUNES.flatMap(r => [`/runes/${r.id}/`, `/uk/runes/${r.id}/`])];
for (const p of expected) check(sitemap.includes(`<loc>${SITE}${p}</loc>`), `sitemap.xml: missing ${p}`);
check((sitemap.match(/<url>/g) || []).length === expected.length, 'sitemap.xml: unexpected extra URLs');
check(!sitemap.includes('<lastmod>'), 'sitemap.xml: <lastmod> should be removed');
check(read('robots.txt').includes(`Sitemap: ${SITE}/sitemap.xml`), 'robots.txt: missing Sitemap line');
console.log('✓ sitemap.xml + robots.txt');

console.log('\nAll SEO page tests passed ✓');
