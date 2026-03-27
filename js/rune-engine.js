import { RUNES } from './runes.js';

// Returns the rune id for today — same for everyone on the same calendar day.
export function getDailyRune() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return RUNES[dayOfYear % RUNES.length].id;
}
