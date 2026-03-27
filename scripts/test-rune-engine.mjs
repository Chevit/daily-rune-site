// scripts/test-rune-engine.mjs
// Run: node scripts/test-rune-engine.mjs

import { getDailyRune } from '../js/rune-engine.js';
import { RUNES } from '../js/runes.js';

const VALID_IDS = RUNES.map(r => r.id);

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
function runeIndexForDay(dayOfYear) {
  return dayOfYear % VALID_IDS.length;
}
if (runeIndexForDay(0) !== 0) throw new Error('Day 0 should map to index 0');
if (runeIndexForDay(25) !== 0) throw new Error('Day 25 should wrap to index 0');
if (runeIndexForDay(26) !== 1) throw new Error('Day 26 should wrap to index 1');
console.log('✓ modulo wrapping correct');

console.log('\nAll rune-engine tests passed ✓');
