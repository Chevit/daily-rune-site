// scripts/gen-locales.mjs
// Run from repo root: node scripts/gen-locales.mjs
// Reads rune-translations-casual.json (uses 'uk' locale key)
// Writes js/locales.js (uses 'ua' locale key internally)

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { RUNES } from '../js/runes.js';

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

// Names are not in the JSON — kept here so a JSON re-export can't drop them.
const NAMES = {
  fehu: { en: 'Fehu', uk: 'Феу' },
  uruz: { en: 'Uruz', uk: 'Уруз' },
  thurisaz: { en: 'Thurisaz', uk: 'Турісаз' },
  ansuz: { en: 'Ansuz', uk: 'Ансуз' },
  raidho: { en: 'Raidho', uk: 'Райдо' },
  kenaz: { en: 'Kenaz', uk: 'Кеназ' },
  gebo: { en: 'Gebo', uk: 'Ґебо' },
  wunjo: { en: 'Wunjo', uk: 'Вунйо' },
  hagalaz: { en: 'Hagalaz', uk: 'Хагалаз' },
  nauthiz: { en: 'Nauthiz', uk: 'Наутіз' },
  isa: { en: 'Isa', uk: 'Іса' },
  jera: { en: 'Jera', uk: 'Єра' },
  eihwaz: { en: 'Eihwaz', uk: 'Ейваз' },
  perthro: { en: 'Perthro', uk: 'Пертро' },
  algiz: { en: 'Algiz', uk: 'Альґіз' },
  sowilo: { en: 'Sowilo', uk: 'Совіло' },
  tiwaz: { en: 'Tiwaz', uk: 'Тіваз' },
  berkano: { en: 'Berkano', uk: 'Беркана' },
  ehwaz: { en: 'Ehwaz', uk: 'Еваз' },
  mannaz: { en: 'Mannaz', uk: 'Манназ' },
  laguz: { en: 'Laguz', uk: 'Лагуз' },
  ingwaz: { en: 'Ingwaz', uk: 'Інгваз' },
  dagaz: { en: 'Dagaz', uk: 'Даґаз' },
  othala: { en: 'Othala', uk: 'Отала' },
  blank: { en: 'Odin (Blank Rune)', uk: 'Порожня руна' },
};

function buildRunes(jsonLocale) {
  const result = {};
  for (const id of EXPECTED_IDS) {
    const d = translations[id][jsonLocale];
    const name = NAMES[id]?.[jsonLocale];
    if (!name) throw new Error(`Missing name: ${id}/${jsonLocale}`);
    const reversible = RUNES.find(r => r.id === id).isReversible;
    if (reversible !== Boolean(d.reversedMeaning)) {
      throw new Error(`${id}/${jsonLocale}: isReversible=${reversible} but reversedMeaning ${d.reversedMeaning ? 'present' : 'missing'}`);
    }
    result[id] = {
      name,
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
    readFullMeaning: 'Read full meaning →',
    allRuneMeanings: 'All rune meanings',
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
    readFullMeaning: 'Повне значення →',
    allRuneMeanings: 'Значення всіх рун',
    runes: ${JSON.stringify(runesUa, null, 4)},
  },
};
`;

writeFileSync(join(root, 'js', 'locales.js'), output, 'utf8');
console.log('js/locales.js written ✓');
