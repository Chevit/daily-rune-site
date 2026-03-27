import { getInitialLocale } from '../js/page-locale.js';

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

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
