import { getInitialLocale, htmlLang } from '../js/page-locale.js';

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`  ✓ ${description}`);
    passed++;
  } else {
    console.error(`  ✗ ${description}`);
    failed++;
  }
}

console.log('getInitialLocale:');
assert('uses query param when present',       getInitialLocale('?locale=ua', 'en') === 'ua');
assert('uses storage when no query param',    getInitialLocale('', 'ua') === 'ua');
assert('defaults to en when neither present', getInitialLocale('', null) === 'en');
assert('query param overrides storage',       getInitialLocale('?locale=en', 'ua') === 'en');
assert('ignores unrelated query params',      getInitialLocale('?foo=bar', 'ua') === 'ua');
assert('accepts es from the query param',     getInitialLocale('?locale=es', 'en') === 'es');
assert('accepts es from storage',             getInitialLocale('', 'es') === 'es');
assert('unknown query value falls back to storage', getInitialLocale('?locale=fr', 'ua') === 'ua');
assert('unknown query value with no storage → en',  getInitialLocale('?locale=fr', null) === 'en');
assert('unknown stored value → en',           getInitialLocale('', 'de') === 'en');

console.log('htmlLang:');
assert('ua maps to uk', htmlLang('ua') === 'uk');
assert('es maps to es', htmlLang('es') === 'es');
assert('en maps to en', htmlLang('en') === 'en');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
