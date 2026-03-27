# Subpages Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle `privacy-policy.html`, `support.html`, and `terms-of-use.html` to use the dark runic theme and modular architecture of `index.html`, with a shared `js/page-locale.js` module for locale management via query param + localStorage.

**Architecture:** A new `js/page-locale.js` ES module handles locale detection (`?locale=` query param → `localStorage` → `'en'`), persists to `localStorage`, and wires the `EN | UA` toggle. Each subpage loads `css/styles.css` and `js/page-locale.js`, uses `.page` / `.site-header` layout, and shows/hides `[data-lang]` content divs. `index.html` footer links get `target="_blank"`, `data-href` attributes, and `app.js` dynamically appends `?locale=<current>` so opened tabs inherit the active locale.

**Tech Stack:** Vanilla ES modules, CSS custom properties, no build step.

---

### Task 1: Add subpage CSS to `css/styles.css`

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Append subpage styles to the end of `css/styles.css`**

Add these rules after the last line of `css/styles.css`:

```css
/* ── Subpage layout ── */
.subpage-title {
  font-size: 28px;
  margin-top: 24px;
}
.back-link {
  display: block;
  text-align: center;
  font-size: 11px;
  color: var(--muted);
  text-decoration: none;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: color 0.2s;
  margin-top: 8px;
  margin-bottom: 40px;
}
.back-link:hover { color: var(--accent); }

/* ── Subpage content card ── */
.content-card {
  background: var(--stone);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 28px 24px;
  width: 100%;
}

/* ── Subpage typography ── */
.subpage-content h2 {
  font-size: 12px;
  color: var(--accent);
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: normal;
  margin-top: 32px;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}
.subpage-content h3 {
  font-size: 13px;
  color: var(--text);
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 6px;
}
.subpage-content p,
.subpage-content li {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text);
}
.subpage-content ul {
  padding-left: 20px;
  margin: 8px 0;
}
.subpage-content a {
  color: var(--accent);
}
.subpage-content .last-updated,
.subpage-content .subtitle {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 1px;
  display: block;
  margin-bottom: 24px;
}
.subpage-contact-box {
  background: rgba(200,135,58,0.06);
  border: 1px solid rgba(200,135,58,0.18);
  border-radius: 6px;
  padding: 20px 24px;
  margin-top: 24px;
}
.subpage-contact-box p {
  margin: 0 0 8px;
}
.subpage-contact-box a.email {
  display: inline-block;
  margin-top: 8px;
  color: var(--accent);
  font-size: 15px;
  letter-spacing: 0.5px;
}
.subpage-footer {
  margin-top: 36px;
  font-size: 11px;
  color: var(--muted);
  text-align: center;
  letter-spacing: 1px;
}
.subpage-footer a {
  color: var(--muted);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  transition: color 0.2s;
}
.subpage-footer a:hover { color: var(--accent); }

/* ── Reduced motion: subpages ── */
@media (prefers-reduced-motion: reduce) {
  .back-link { transition: none; }
}
```

- [ ] **Step 2: Verify no syntax errors**

Open `css/styles.css` in a browser (or open any page that loads it) and check the browser console shows no CSS errors.

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: add subpage CSS (back-link, content-card, subpage-content typography)"
```

---

### Task 2: Create `js/page-locale.js`

**Files:**
- Create: `js/page-locale.js`
- Create: `scripts/test-page-locale.mjs`

- [ ] **Step 1: Write the failing test**

Create `scripts/test-page-locale.mjs`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

```
node scripts/test-page-locale.mjs
```

Expected: error `Cannot find module '../js/page-locale.js'` (or similar import error).

- [ ] **Step 3: Create `js/page-locale.js`**

```js
/**
 * Shared locale module for subpages (privacy-policy, support, terms-of-use).
 * Exported pure functions are testable in Node.js.
 * DOM side-effects are guarded by typeof window check.
 */

/**
 * Determine the initial locale.
 * Priority: ?locale= query param → localStorage value → 'en'
 */
export function getInitialLocale(searchString, storageValue) {
  const params = new URLSearchParams(searchString);
  return params.get('locale') || storageValue || 'en';
}

function _setLocale(locale) {
  document.querySelectorAll('[data-lang]').forEach(el => {
    el.style.display = el.dataset.lang === locale ? '' : 'none';
  });
  document.querySelectorAll('.locale-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.locale === locale);
  });
  document.documentElement.lang = locale === 'ua' ? 'uk' : 'en';
}

export function applyLocale(locale, animate) {
  if (animate) {
    const page = document.querySelector('.page');
    if (page) page.style.opacity = '0.3';
    setTimeout(() => {
      _setLocale(locale);
      if (page) page.style.opacity = '';
    }, 200);
  } else {
    _setLocale(locale);
  }
}

if (typeof window !== 'undefined') {
  const initial = getInitialLocale(
    window.location.search,
    localStorage.getItem('locale')
  );
  localStorage.setItem('locale', initial);
  applyLocale(initial, false);

  document.querySelectorAll('.locale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const locale = btn.dataset.locale;
      localStorage.setItem('locale', locale);
      applyLocale(locale, true);
    });
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

```
node scripts/test-page-locale.mjs
```

Expected output:
```
getInitialLocale:
  ✓ uses query param when present
  ✓ uses storage when no query param
  ✓ defaults to en when neither present
  ✓ query param overrides storage
  ✓ ignores unrelated query params

5 passed, 0 failed
```

- [ ] **Step 5: Commit**

```bash
git add js/page-locale.js scripts/test-page-locale.mjs
git commit -m "feat: add page-locale.js shared locale module with tests"
```

---

### Task 3: Restyle `privacy-policy.html`

**Files:**
- Modify: `privacy-policy.html`

- [ ] **Step 1: Replace the entire file with the dark-themed version**

Replace `privacy-policy.html` with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <title>Privacy Policy — Daily Rune</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="page">

    <header class="site-header">
      <div class="locale-toggle">
        <button class="locale-btn active" data-locale="en">EN</button>
        <span class="locale-sep">|</span>
        <button class="locale-btn" data-locale="ua">UA</button>
      </div>
      <h1 class="app-title subpage-title">
        <span data-lang="en">Privacy Policy</span>
        <span data-lang="ua">Політика конфіденційності</span>
      </h1>
      <a href="index.html" class="back-link">← Daily Rune</a>
    </header>

    <div class="content-card subpage-content">

      <!-- ENGLISH -->
      <div data-lang="en">
        <span class="last-updated">Last updated: March 18, 2026</span>
        <p>This Privacy Policy describes how <strong>Daily Rune</strong> ("the App", "we", "us") handles information when you use our mobile application. We are committed to being transparent about data practices.</p>

        <h2>1. Information We Collect</h2>
        <p>The App itself does <strong>not collect, store, or transmit any personally identifiable information</strong> to our servers. We do not require account creation, and we do not ask for your name, email address, phone number, or any other personal details.</p>
        <p>The following data is stored <strong>locally on your device only</strong>:</p>
        <ul>
          <li>Your daily reading count (to manage the free reading quota)</li>
          <li>Your premium unlock status (to remember if you have purchased unlimited readings)</li>
          <li>Your analytics consent preference</li>
        </ul>
        <p>This data never leaves your device and is not accessible to us.</p>

        <h2>2. Analytics</h2>
        <p>With your explicit consent, the App uses <strong>Firebase Analytics</strong> by Google to collect anonymous usage data. This helps us understand how users interact with the app and improve the experience.</p>
        <p>When you consent, Firebase Analytics may collect:</p>
        <ul>
          <li>App usage events (e.g. which screens you visit, readings completed)</li>
          <li>Device information (model, operating system version)</li>
          <li>Approximate location derived from IP address</li>
          <li>App performance data</li>
        </ul>
        <p><strong>No personal data is collected.</strong> All analytics data is anonymous and aggregated. You are asked for consent on first launch and can change your preference at any time in the app's Settings screen.</p>
        <p>Firebase Analytics Privacy Policy: <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">https://firebase.google.com/support/privacy</a></p>

        <h2>3. Third-Party Services</h2>
        <p>The App integrates third-party services that may collect data independently. We do not control how these services collect or use data; please review their privacy policies for details.</p>

        <h3>Google AdMob (Advertising)</h3>
        <p>Free-tier users see ads served by <strong>Google AdMob</strong>. AdMob may collect and use:</p>
        <ul>
          <li>Android Advertising ID (GAID) / iOS Identifier for Advertisers (IDFA)</li>
          <li>Device information (model, operating system version)</li>
          <li>Approximate location derived from IP address</li>
          <li>Ad interaction data (impressions, clicks)</li>
          <li>Interest-based profiling data for personalised ads</li>
        </ul>
        <p>You can opt out of personalised advertising at any time via your device settings: <em>Settings → Google → Ads → Opt out of Ads Personalisation</em> (Android) or <em>Settings → Privacy → Tracking</em> (iOS).<br>
        Google's Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">https://policies.google.com/privacy</a></p>

        <h3>Google Play Billing / Apple In-App Purchases</h3>
        <p>If you purchase the premium unlock, the transaction is processed entirely by <strong>Google Play</strong> or <strong>Apple App Store</strong>. We receive only a confirmation token to verify the purchase — no payment details or billing information are shared with us.<br>
        Google Play's Terms: <a href="https://play.google.com/about/play-terms/" target="_blank" rel="noopener">https://play.google.com/about/play-terms/</a><br>
        Apple's Privacy Policy: <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener">https://www.apple.com/legal/privacy/</a></p>

        <h2>4. Permissions</h2>
        <p>The App requests the following device permissions:</p>
        <ul>
          <li><strong>Accelerometer / Motion sensors</strong> — used only to detect a shake gesture to draw runes. No motion data is stored or transmitted.</li>
        </ul>
        <p>The App does <strong>not</strong> request access to your camera, microphone, contacts, precise location, photos, or any other sensitive permissions.</p>

        <h2>5. Your Choices</h2>
        <ul>
          <li><strong>Analytics:</strong> You can withdraw consent at any time via Settings → Help improve the app toggle.</li>
          <li><strong>Personalised Ads:</strong> Opt out via your device's advertising settings.</li>
          <li><strong>Local Data:</strong> Clear all local app data by uninstalling the App or clearing its data via device settings.</li>
        </ul>

        <h2>6. Children's Privacy</h2>
        <p>The App is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided personal information through the App, please contact us and we will take steps to delete it.</p>

        <h2>7. Data Retention</h2>
        <p>Locally stored data remains on your device until you uninstall the App or clear its data via device settings. We hold no data on our own servers.</p>

        <h2>8. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. Continued use of the App after changes constitutes acceptance of the revised policy.</p>

        <h2>9. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:<br>
        <strong><a href="mailto:runes.chevit@gmail.com">runes.chevit@gmail.com</a></strong></p>
      </div>

      <!-- UKRAINIAN -->
      <div data-lang="ua">
        <span class="last-updated">Останнє оновлення: 18 березня 2026 р.</span>
        <p>Ця Політика конфіденційності описує, як <strong>Daily Rune</strong> («Додаток», «ми») обробляє інформацію під час використання нашого мобільного додатку. Ми прагнемо бути прозорими щодо роботи з даними.</p>

        <h2>1. Інформація, яку ми збираємо</h2>
        <p>Додаток <strong>не збирає, не зберігає та не передає жодних персональних даних</strong> на наші сервери. Ми не вимагаємо створення облікового запису та не запитуємо ваше ім'я, електронну адресу, номер телефону чи будь-яку іншу особисту інформацію.</p>
        <p>Наступні дані зберігаються <strong>виключно локально на вашому пристрої</strong>:</p>
        <ul>
          <li>Кількість щоденних ворожінь (для управління безкоштовною квотою)</li>
          <li>Статус преміум-розблокування (щоб пам'ятати, чи придбали ви необмежені ворожіння)</li>
          <li>Ваші налаштування згоди на аналітику</li>
        </ul>
        <p>Ці дані ніколи не покидають ваш пристрій і недоступні нам.</p>

        <h2>2. Аналітика</h2>
        <p>За вашою явною згодою Додаток використовує <strong>Firebase Analytics</strong> від Google для збору анонімних даних про використання. Це допомагає нам зрозуміти, як користувачі взаємодіють із додатком, та покращити його.</p>
        <p>Якщо ви надаєте згоду, Firebase Analytics може збирати:</p>
        <ul>
          <li>Події використання додатку (наприклад, які екрани ви відвідуєте, завершені ворожіння)</li>
          <li>Інформацію про пристрій (модель, версія операційної системи)</li>
          <li>Приблизне місцезнаходження на основі IP-адреси</li>
          <li>Дані про продуктивність додатку</li>
        </ul>
        <p><strong>Особисті дані не збираються.</strong> Всі аналітичні дані є анонімними та агрегованими. Ми запитуємо згоду під час першого запуску, і ви можете змінити своє рішення будь-коли в розділі Налаштування.</p>
        <p>Політика конфіденційності Firebase Analytics: <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">https://firebase.google.com/support/privacy</a></p>

        <h2>3. Сторонні сервіси</h2>
        <p>Додаток інтегрує сторонні сервіси, які можуть збирати дані самостійно. Ми не контролюємо, як ці сервіси збирають або використовують дані; будь ласка, ознайомтеся з їхніми політиками конфіденційності.</p>

        <h3>Google AdMob (реклама)</h3>
        <p>Користувачі безкоштовного рівня бачать рекламу від <strong>Google AdMob</strong>. AdMob може збирати та використовувати:</p>
        <ul>
          <li>Ідентифікатор реклами Android (GAID) / Ідентифікатор рекламодавця iOS (IDFA)</li>
          <li>Інформацію про пристрій (модель, версія операційної системи)</li>
          <li>Приблизне місцезнаходження на основі IP-адреси</li>
          <li>Дані про взаємодію з рекламою (покази, кліки)</li>
          <li>Дані профілювання для персоналізованої реклами</li>
        </ul>
        <p>Ви можете відмовитися від персоналізованої реклами в будь-який час через налаштування пристрою: <em>Налаштування → Google → Реклама → Відмовитися від персоналізації реклами</em> (Android) або <em>Налаштування → Конфіденційність → Відстеження</em> (iOS).<br>
        Політика конфіденційності Google: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">https://policies.google.com/privacy</a></p>

        <h3>Google Play Billing / Apple In-App Purchases</h3>
        <p>Якщо ви купуєте преміум-розблокування, транзакція обробляється виключно <strong>Google Play</strong> або <strong>Apple App Store</strong>. Ми отримуємо лише підтверджувальний токен для перевірки покупки — жодні платіжні дані нам не передаються.<br>
        Умови Google Play: <a href="https://play.google.com/about/play-terms/" target="_blank" rel="noopener">https://play.google.com/about/play-terms/</a><br>
        Політика конфіденційності Apple: <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener">https://www.apple.com/legal/privacy/</a></p>

        <h2>4. Дозволи</h2>
        <p>Додаток запитує наступні дозволи пристрою:</p>
        <ul>
          <li><strong>Акселерометр / Датчики руху</strong> — використовується виключно для визначення жесту струшування з метою витягнути руни. Жодні дані про рух не зберігаються та не передаються.</li>
        </ul>
        <p>Додаток <strong>не</strong> запитує доступ до камери, мікрофона, контактів, точного місцезнаходження, фотографій чи будь-яких інших конфіденційних дозволів.</p>

        <h2>5. Ваші права</h2>
        <ul>
          <li><strong>Аналітика:</strong> Ви можете відкликати згоду будь-коли через Налаштування → перемикач «Допомогти покращити додаток».</li>
          <li><strong>Персоналізована реклама:</strong> Відмовтеся через налаштування реклами на вашому пристрої.</li>
          <li><strong>Локальні дані:</strong> Очистіть усі локальні дані, видаливши Додаток або очистивши його дані через налаштування пристрою.</li>
        </ul>

        <h2>6. Конфіденційність дітей</h2>
        <p>Додаток не призначений для дітей віком до 13 років. Ми свідомо не збираємо персональні дані дітей. Якщо ви вважаєте, що дитина надала персональні дані через Додаток, будь ласка, зв'яжіться з нами, і ми вживемо заходів для їх видалення.</p>

        <h2>7. Зберігання даних</h2>
        <p>Локально збережені дані залишаються на вашому пристрої до видалення Додатку або очищення його даних через налаштування пристрою. Ми не зберігаємо жодних даних на власних серверах.</p>

        <h2>8. Зміни до цієї політики</h2>
        <p>Ми можемо час від часу оновлювати цю Політику конфіденційності. Зміни будуть опубліковані на цій сторінці з оновленою датою. Продовження використання Додатку після змін означає прийняття оновленої політики.</p>

        <h2>9. Зв'яжіться з нами</h2>
        <p>Якщо у вас є запитання щодо цієї Політики конфіденційності, будь ласка, зв'яжіться з нами:<br>
        <strong><a href="mailto:runes.chevit@gmail.com">runes.chevit@gmail.com</a></strong></p>
      </div>

    </div>
  </div>

  <script type="module" src="js/page-locale.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `privacy-policy.html` directly in a browser (file:// or local server):
- Dark background, runic wallpaper visible
- `EN | UA` toggle in top-right
- `← DAILY RUNE` back-link below title
- English content visible by default
- Click `UA` — content fades, Ukrainian text appears, toggle updates
- Open `privacy-policy.html?locale=ua` — page loads in Ukrainian directly
- After switching locale on this page, go to `index.html` — locale toggle reflects the new choice

- [ ] **Step 3: Commit**

```bash
git add privacy-policy.html
git commit -m "feat: restyle privacy-policy.html with dark theme and page-locale.js"
```

---

### Task 4: Restyle `support.html`

**Files:**
- Modify: `support.html`

- [ ] **Step 1: Replace the entire file with the dark-themed version**

Replace `support.html` with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <title>Support — Daily Rune</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="page">

    <header class="site-header">
      <div class="locale-toggle">
        <button class="locale-btn active" data-locale="en">EN</button>
        <span class="locale-sep">|</span>
        <button class="locale-btn" data-locale="ua">UA</button>
      </div>
      <h1 class="app-title subpage-title">
        <span data-lang="en">Support</span>
        <span data-lang="ua">Підтримка</span>
      </h1>
      <a href="index.html" class="back-link">← Daily Rune</a>
    </header>

    <div class="content-card subpage-content">

      <!-- ENGLISH -->
      <div data-lang="en">
        <span class="subtitle">Daily Rune — Elder Futhark Divination App</span>

        <h2>Frequently Asked Questions</h2>

        <h3>How many readings do I get for free?</h3>
        <p>Free users receive a set number of readings per day. Once the daily limit is reached, you can wait until the next day or unlock unlimited readings with a one-time premium purchase.</p>

        <h3>How do I unlock unlimited readings?</h3>
        <p>Tap the unlock button on the Home screen or when you reach your daily limit. The premium upgrade is a one-time purchase — you will never be charged again.</p>

        <h3>I purchased premium but it's not showing up</h3>
        <p>Try the following steps:</p>
        <ul>
          <li>Close and reopen the App</li>
          <li>Make sure you are connected to the internet</li>
          <li>Check that you are signed into the same Google Play / App Store account used for the purchase</li>
          <li>Uninstall and reinstall the App — your purchase will be restored automatically</li>
        </ul>
        <p>If the issue persists, please contact us with your order number.</p>

        <h3>How does the shake-to-draw feature work?</h3>
        <p>On the rune board screen, give your phone a short shake and the runes will be shuffled. Tap a rune to select it. In three-rune mode, select three runes one at a time.</p>

        <h3>What is a reversed rune?</h3>
        <p>Some runes have a reversed (merkstave) meaning when drawn upside-down. The App randomly determines reversal for each rune drawn, adding depth to your reading.</p>

        <h3>How do I change the reading style?</h3>
        <p>Go to <strong>Settings</strong> and toggle between <em>Traditional</em> and <em>Casual</em> reading styles. Traditional uses classical rune interpretations; Casual uses a more modern, conversational tone.</p>

        <h3>How do I turn off analytics?</h3>
        <p>Go to <strong>Settings</strong> and toggle off <em>Help improve the app</em>. This immediately disables all analytics data collection.</p>

        <h3>How do I turn off personalised ads?</h3>
        <p>On Android: <em>Settings → Google → Ads → Opt out of Ads Personalisation</em>.<br>
        On iOS: <em>Settings → Privacy → Tracking</em> and disable tracking for Daily Rune.</p>

        <h3>The app is crashing or not working correctly</h3>
        <p>Try these steps first:</p>
        <ul>
          <li>Update the App to the latest version from the store</li>
          <li>Restart your device</li>
          <li>Uninstall and reinstall the App</li>
        </ul>
        <p>If the problem continues, please email us with a description of the issue and your device model and OS version.</p>

        <h2>Contact Us</h2>
        <div class="subpage-contact-box">
          <p>Can't find an answer above? We're happy to help.</p>
          <p>Send us an email and we'll get back to you as soon as possible.</p>
          <a class="email" href="mailto:runes.chevit@gmail.com">runes.chevit@gmail.com</a>
        </div>

        <p class="subpage-footer">
          <a href="privacy-policy.html">Privacy Policy</a>
          &nbsp;·&nbsp;
          <a href="terms-of-use.html">Terms of Use</a>
        </p>
      </div>

      <!-- UKRAINIAN -->
      <div data-lang="ua">
        <span class="subtitle">Daily Rune — Додаток для ворожіння на рунах старшого футарку</span>

        <h2>Часті запитання</h2>

        <h3>Скільки ворожінь я отримую безкоштовно?</h3>
        <p>Безкоштовні користувачі отримують певну кількість ворожінь на день. Після досягнення денного ліміту ви можете зачекати до наступного дня або розблокувати необмежені ворожіння одноразовою преміум-покупкою.</p>

        <h3>Як розблокувати необмежені ворожіння?</h3>
        <p>Натисніть кнопку розблокування на головному екрані або коли досягнете денного ліміту. Преміум-розблокування — це одноразова покупка, більше з вас нічого не стягуватиметься.</p>

        <h3>Я придбав преміум, але він не відображається</h3>
        <p>Спробуйте наступні кроки:</p>
        <ul>
          <li>Закрийте та знову відкрийте Додаток</li>
          <li>Переконайтеся, що ви підключені до інтернету</li>
          <li>Перевірте, що ви увійшли в той самий обліковий запис Google Play / App Store, який використовувався для покупки</li>
          <li>Видаліть та перевстановіть Додаток — ваша покупка відновиться автоматично</li>
        </ul>
        <p>Якщо проблема не зникає, зв'яжіться з нами, вказавши номер замовлення.</p>

        <h3>Як працює функція струшування?</h3>
        <p>На екрані рунічної дошки злегка струсніть телефон — руни перемішаються. Торкніться руни, щоб вибрати її. У режимі трьох рун вибирайте по одній руні за раз.</p>

        <h3>Що таке перевернута руна?</h3>
        <p>Деякі руни мають перевернуте (меркставе) значення, коли витягуються догори дном. Додаток випадково визначає перевернутість кожної витягнутої руни, додаючи глибини вашому ворожінню.</p>

        <h3>Як змінити стиль читання?</h3>
        <p>Перейдіть до <strong>Налаштувань</strong> та переключіться між стилями <em>Традиційний</em> та <em>Casual</em>. Традиційний використовує класичні тлумачення рун; Casual — сучасніший, розмовний тон.</p>

        <h3>Як вимкнути аналітику?</h3>
        <p>Перейдіть до <strong>Налаштувань</strong> та вимкніть перемикач <em>Допомогти покращити додаток</em>. Це негайно вимкне збір аналітичних даних.</p>

        <h3>Як вимкнути персоналізовану рекламу?</h3>
        <p>На Android: <em>Налаштування → Google → Реклама → Відмовитися від персоналізації реклами</em>.<br>
        На iOS: <em>Налаштування → Конфіденційність → Відстеження</em> та вимкніть відстеження для Daily Rune.</p>

        <h3>Додаток зависає або працює некоректно</h3>
        <p>Спробуйте спочатку ці кроки:</p>
        <ul>
          <li>Оновіть Додаток до останньої версії в магазині</li>
          <li>Перезавантажте пристрій</li>
          <li>Видаліть та перевстановіть Додаток</li>
        </ul>
        <p>Якщо проблема залишається, надішліть нам листа з описом проблеми, моделлю пристрою та версією операційної системи.</p>

        <h2>Зв'яжіться з нами</h2>
        <div class="subpage-contact-box">
          <p>Не знайшли відповідь вище? Ми раді допомогти.</p>
          <p>Надішліть нам листа, і ми відповімо якнайшвидше.</p>
          <a class="email" href="mailto:runes.chevit@gmail.com">runes.chevit@gmail.com</a>
        </div>

        <p class="subpage-footer">
          <a href="privacy-policy.html">Політика конфіденційності</a>
          &nbsp;·&nbsp;
          <a href="terms-of-use.html">Умови використання</a>
        </p>
      </div>

    </div>
  </div>

  <script type="module" src="js/page-locale.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `support.html`:
- Dark theme visible, FAQ sections readable
- Contact box has amber border, email link in accent color
- `EN | UA` toggle works; `support.html?locale=ua` loads in Ukrainian

- [ ] **Step 3: Commit**

```bash
git add support.html
git commit -m "feat: restyle support.html with dark theme and page-locale.js"
```

---

### Task 5: Restyle `terms-of-use.html`

**Files:**
- Modify: `terms-of-use.html`

- [ ] **Step 1: Replace the entire file with the dark-themed version**

Replace `terms-of-use.html` with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <title>Terms of Use — Daily Rune</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="page">

    <header class="site-header">
      <div class="locale-toggle">
        <button class="locale-btn active" data-locale="en">EN</button>
        <span class="locale-sep">|</span>
        <button class="locale-btn" data-locale="ua">UA</button>
      </div>
      <h1 class="app-title subpage-title">
        <span data-lang="en">Terms of Use</span>
        <span data-lang="ua">Умови використання</span>
      </h1>
      <a href="index.html" class="back-link">← Daily Rune</a>
    </header>

    <div class="content-card subpage-content">

      <!-- ENGLISH -->
      <div data-lang="en">
        <span class="last-updated">Last updated: March 18, 2026</span>
        <p>Please read these Terms of Use carefully before using <strong>Daily Rune</strong> ("the App"). By downloading or using the App, you agree to be bound by these terms. If you do not agree, do not use the App.</p>

        <h2>1. About the App</h2>
        <p>Daily Rune is an entertainment and personal reflection application based on Elder Futhark rune symbolism. The App is intended for entertainment, meditation, and personal reflection purposes only. Rune readings provided by the App are not a substitute for professional advice of any kind — including medical, legal, financial, or psychological advice.</p>

        <h2>2. Eligibility</h2>
        <p>The App is intended for users aged 13 and older. By using the App, you confirm that you meet this age requirement. Users under 18 should have parental or guardian consent.</p>

        <h2>3. License</h2>
        <p>We grant you a limited, non-exclusive, non-transferable, revocable license to use the App for personal, non-commercial purposes. You may not:</p>
        <ul>
          <li>Copy, modify, or distribute the App or its content</li>
          <li>Reverse engineer or attempt to extract the source code</li>
          <li>Use the App for any unlawful purpose</li>
          <li>Sell, resell, or sublicense access to the App</li>
        </ul>

        <h2>4. In-App Purchases</h2>
        <p>The App offers a one-time premium unlock purchase that removes the daily reading limit. All purchases are processed by Google Play or the Apple App Store and are subject to their respective terms and refund policies. We do not handle payment information directly.</p>
        <p>Purchases are non-refundable except where required by applicable law or the platform's refund policy. If you experience an issue with a purchase, please contact us at <a href="mailto:runes.chevit@gmail.com">runes.chevit@gmail.com</a>.</p>

        <h2>5. Free Tier Limitations</h2>
        <p>Free users are limited to a set number of readings per day as determined by the App's configuration. This limit may change over time. We reserve the right to modify the free tier at any time without prior notice.</p>

        <h2>6. Advertisements</h2>
        <p>Free-tier users may see advertisements served by Google AdMob. Premium users do not see ads. We are not responsible for the content of third-party advertisements displayed within the App.</p>

        <h2>7. Disclaimer of Warranties</h2>
        <p>The App is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the App will be uninterrupted, error-free, or free of harmful components. Rune readings are generated for entertainment purposes only and carry no guarantee of accuracy or outcome.</p>

        <h2>8. Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App, including but not limited to decisions made based on rune readings provided by the App.</p>

        <h2>9. Intellectual Property</h2>
        <p>All content within the App — including rune descriptions, imagery, design, and code — is owned by or licensed to us and is protected by applicable intellectual property laws. You may not reproduce or use any App content outside the App without written permission.</p>

        <h2>10. Changes to These Terms</h2>
        <p>We may update these Terms of Use from time to time. Changes will be posted on this page with an updated "Last updated" date. Continued use of the App after changes constitutes acceptance of the revised terms.</p>

        <h2>11. Governing Law</h2>
        <p>These Terms are governed by the laws of Ukraine. Any disputes shall be resolved in accordance with applicable Ukrainian law.</p>

        <h2>12. Contact Us</h2>
        <p>If you have any questions about these Terms of Use, please contact us at:<br>
        <strong><a href="mailto:runes.chevit@gmail.com">runes.chevit@gmail.com</a></strong></p>
      </div>

      <!-- UKRAINIAN -->
      <div data-lang="ua">
        <span class="last-updated">Останнє оновлення: 18 березня 2026 р.</span>
        <p>Будь ласка, уважно прочитайте ці Умови використання перед тим, як користуватися <strong>Daily Rune</strong> («Додаток»). Завантажуючи або використовуючи Додаток, ви погоджуєтеся з цими умовами. Якщо ви не погоджуєтеся — не використовуйте Додаток.</p>

        <h2>1. Про Додаток</h2>
        <p>Daily Rune — це розважальний додаток для особистого роздуму на основі символіки старшого футарку. Додаток призначений виключно для розваги, медитації та особистого роздуму. Рунічні ворожіння, надані Додатком, не замінюють жодних професійних порад — медичних, юридичних, фінансових або психологічних.</p>

        <h2>2. Вікові вимоги</h2>
        <p>Додаток призначений для користувачів віком від 13 років. Використовуючи Додаток, ви підтверджуєте, що відповідаєте цій вимозі. Користувачам до 18 років необхідна згода батьків або опікунів.</p>

        <h2>3. Ліцензія</h2>
        <p>Ми надаємо вам обмежену, невиключну, непередавану, відкличну ліцензію на використання Додатку в особистих, некомерційних цілях. Вам забороняється:</p>
        <ul>
          <li>Копіювати, змінювати або розповсюджувати Додаток чи його контент</li>
          <li>Здійснювати зворотний інжиніринг або намагатися отримати вихідний код</li>
          <li>Використовувати Додаток у незаконних цілях</li>
          <li>Продавати або передавати в субліцензію доступ до Додатку</li>
        </ul>

        <h2>4. Покупки в додатку</h2>
        <p>Додаток пропонує одноразову покупку преміум-розблокування, яка знімає денний ліміт ворожінь. Усі покупки обробляються Google Play або Apple App Store відповідно до їхніх умов та політик повернення коштів. Ми не обробляємо платіжну інформацію безпосередньо.</p>
        <p>Покупки не підлягають поверненню, крім випадків, передбачених чинним законодавством або політикою повернення платформи. Якщо у вас виникла проблема з покупкою, зверніться до нас за адресою <a href="mailto:runes.chevit@gmail.com">runes.chevit@gmail.com</a>.</p>

        <h2>5. Обмеження безкоштовного рівня</h2>
        <p>Безкоштовні користувачі обмежені певною кількістю ворожінь на день відповідно до налаштувань Додатку. Цей ліміт може змінюватися з часом. Ми залишаємо за собою право змінювати умови безкоштовного рівня в будь-який час без попереднього повідомлення.</p>

        <h2>6. Реклама</h2>
        <p>Користувачі безкоштовного рівня можуть бачити рекламу від Google AdMob. Преміум-користувачі реклами не бачать. Ми не несемо відповідальності за зміст реклами третіх сторін, що відображається в Додатку.</p>

        <h2>7. Відмова від гарантій</h2>
        <p>Додаток надається «як є» та «як доступно» без будь-яких явних або неявних гарантій. Ми не гарантуємо, що Додаток працюватиме без перебоїв або помилок. Рунічні ворожіння генеруються виключно для розваги та не несуть жодних гарантій точності чи результату.</p>

        <h2>8. Обмеження відповідальності</h2>
        <p>У межах, дозволених законом, ми не несемо відповідальності за будь-які непрямі, випадкові, спеціальні або наслідкові збитки, що виникають внаслідок використання Додатку, включаючи рішення, прийняті на основі рунічних ворожінь.</p>

        <h2>9. Інтелектуальна власність</h2>
        <p>Весь контент Додатку — включаючи описи рун, зображення, дизайн та код — належить нам або ліцензований нам і захищений відповідним законодавством про інтелектуальну власність. Ви не можете відтворювати або використовувати будь-який контент Додатку поза ним без письмового дозволу.</p>

        <h2>10. Зміни до умов</h2>
        <p>Ми можемо час від часу оновлювати ці Умови використання. Зміни будуть опубліковані на цій сторінці з оновленою датою. Продовження використання Додатку після змін означає прийняття оновлених умов.</p>

        <h2>11. Застосовне право</h2>
        <p>Ці Умови регулюються законодавством України. Будь-які спори вирішуються відповідно до чинного законодавства України.</p>

        <h2>12. Зв'яжіться з нами</h2>
        <p>Якщо у вас є запитання щодо цих Умов використання, будь ласка, зв'яжіться з нами:<br>
        <strong><a href="mailto:runes.chevit@gmail.com">runes.chevit@gmail.com</a></strong></p>
      </div>

    </div>
  </div>

  <script type="module" src="js/page-locale.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `terms-of-use.html`:
- Dark theme, 12 sections readable
- Toggle and `?locale=ua` query param work as expected

- [ ] **Step 3: Commit**

```bash
git add terms-of-use.html
git commit -m "feat: restyle terms-of-use.html with dark theme and page-locale.js"
```

---

### Task 6: Update `index.html` and `js/app.js` for new-tab links with locale param

**Files:**
- Modify: `index.html`
- Modify: `js/app.js`

- [ ] **Step 1: Update footer links in `index.html`**

In `index.html`, replace the three footer anchor tags:

Old:
```html
      <a href="privacy-policy.html" id="privacyLink"></a>
      <a href="support.html" id="supportLink"></a>
      <a href="terms-of-use.html" id="termsLink"></a>
```

New:
```html
      <a data-href="privacy-policy.html" id="privacyLink" target="_blank" rel="noopener"></a>
      <a data-href="support.html" id="supportLink" target="_blank" rel="noopener"></a>
      <a data-href="terms-of-use.html" id="termsLink" target="_blank" rel="noopener"></a>
```

Note: `href` is removed from HTML — it will be set dynamically by `app.js`.

- [ ] **Step 2: Add `updateFooterLinks` to `js/app.js`**

Replace the full contents of `js/app.js` with:

```js
import { getDailyRune } from './rune-engine.js';
import { UI } from './ui.js';

const runeId = getDailyRune();
let currentLocale = localStorage.getItem('locale') || 'en';

const ui = new UI();
ui.render(runeId, currentLocale);
ui.initScrollReveals();
updateFooterLinks(currentLocale);

function updateFooterLinks(locale) {
  ['privacyLink', 'supportLink', 'termsLink'].forEach(id => {
    const el = document.getElementById(id);
    el.href = `${el.dataset.href}?locale=${locale}`;
  });
}

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
    updateFooterLinks(newLocale);
  });
});
```

- [ ] **Step 3: Verify in browser**

Open `index.html`:
- Footer links (Privacy Policy, Support, Terms of Use) open in a new tab
- The opened tab URL includes `?locale=en` (or `?locale=ua` if UA is active)
- Switch locale on `index.html` then click a footer link — opened tab is in the new locale
- The opened tab inherits the locale toggle state

- [ ] **Step 4: Commit**

```bash
git add index.html js/app.js
git commit -m "feat: footer links open in new tab with locale query param"
```
