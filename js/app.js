import { getDailyRune } from './rune-engine.js';
import { UI } from './ui.js';

const runeId = getDailyRune();
let currentLocale = localStorage.getItem('locale') || 'en';

const ui = new UI();
ui.render(runeId, currentLocale);
ui.initScrollReveals();

function reveal() {
  ui.flip();
  ui.revealMeaning();
}

document.getElementById('revealBtn').addEventListener('click', reveal);
document.getElementById('cardContainer').addEventListener('click', reveal);

document.querySelectorAll('.locale-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const newLocale = btn.dataset.locale;
    if (newLocale === currentLocale) return;
    currentLocale = newLocale;
    localStorage.setItem('locale', newLocale);
    ui.switchLocale(newLocale);
  });
});
