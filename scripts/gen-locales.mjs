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
