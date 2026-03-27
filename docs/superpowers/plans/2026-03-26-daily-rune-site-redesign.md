# Daily Rune Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Daily Rune landing page from a monolithic single-file app into a modular ES module architecture with EN/UA localization, official App Store badge, scroll-reveal animations, and a locale-switch fade transition.

**Architecture:** `index.html` is a pure shell that loads `js/app.js` as an ES module entry point. `app.js` wires four focused modules: `runes.js` (data), `locales.js` (all translated strings), `rune-engine.js` (daily rune selection), and `ui.js` (all DOM interaction). CSS lives in `css/styles.css`. No bundler; direct GitHub Pages deploy.

**Tech Stack:** Vanilla ES modules (`type="module"`), CSS custom properties, `IntersectionObserver`, `localStorage`, `Intl.DateTimeFormat`. Serve locally via `python -m http.server 8080` (ES modules require a server; `file://` won't work).

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `js/runes.js` | Canonical rune array (id, unicodeSymbol, isReversible, EN data) |
| Create | `js/locales.js` | EN + UA UI strings and all 25 rune name/keywords/meaning |
| Create | `js/rune-engine.js` | `getDailyRune()` → rune id string |
| Create | `js/ui.js` | `UI` class: render, flip, revealMeaning, switchLocale, initScrollReveals |
| Create | `js/app.js` | Entry point: wires all modules, attaches event listeners |
| Create | `css/styles.css` | All styles extracted from index.html + new: locale toggle, scroll-reveal, badge |
| Create | `assets/app-store-badge.svg` | Official Apple "Download on the App Store" badge SVG |
| Rewrite | `index.html` | Shell: loads css/styles.css + js/app.js, no inline JS or CSS |
| Delete | `runes.ts` | Superseded by js/runes.js (plain JS) — delete after Task 1 |

---

## Task 1: Create `js/runes.js`

Convert `runes.ts` to plain ES module JS. This is the canonical data source; the UI reads display text from `locales.js`, not here (except `unicodeSymbol`).

**Files:**
- Create: `js/runes.js`

- [ ] **Step 1: Create js/runes.js**

```js
// js/runes.js
// Canonical rune data. unicodeSymbol is locale-agnostic.
// Display text (name, keywords, uprightMeaning) is in locales.js.
export const RUNES = [
  { id: 'fehu',     unicodeSymbol: 'ᚠ', isReversible: true  },
  { id: 'uruz',     unicodeSymbol: 'ᚢ', isReversible: true  },
  { id: 'thurisaz', unicodeSymbol: 'ᚦ', isReversible: true  },
  { id: 'ansuz',    unicodeSymbol: 'ᚨ', isReversible: true  },
  { id: 'raidho',   unicodeSymbol: 'ᚱ', isReversible: true  },
  { id: 'kenaz',    unicodeSymbol: 'ᚲ', isReversible: true  },
  { id: 'gebo',     unicodeSymbol: 'ᚷ', isReversible: false },
  { id: 'wunjo',    unicodeSymbol: 'ᚹ', isReversible: true  },
  { id: 'hagalaz',  unicodeSymbol: 'ᚺ', isReversible: false },
  { id: 'nauthiz',  unicodeSymbol: 'ᚾ', isReversible: true  },
  { id: 'isa',      unicodeSymbol: 'ᛁ', isReversible: false },
  { id: 'jera',     unicodeSymbol: 'ᛃ', isReversible: false },
  { id: 'eihwaz',   unicodeSymbol: 'ᛇ', isReversible: false },
  { id: 'perthro',  unicodeSymbol: 'ᛈ', isReversible: true  },
  { id: 'algiz',    unicodeSymbol: 'ᛉ', isReversible: true  },
  { id: 'sowilo',   unicodeSymbol: 'ᛊ', isReversible: false },
  { id: 'tiwaz',    unicodeSymbol: 'ᛏ', isReversible: true  },
  { id: 'berkano',  unicodeSymbol: 'ᛒ', isReversible: true  },
  { id: 'ehwaz',    unicodeSymbol: 'ᛖ', isReversible: true  },
  { id: 'mannaz',   unicodeSymbol: 'ᛗ', isReversible: true  },
  { id: 'laguz',    unicodeSymbol: 'ᛚ', isReversible: true  },
  { id: 'ingwaz',   unicodeSymbol: 'ᛜ', isReversible: false },
  { id: 'dagaz',    unicodeSymbol: 'ᛞ', isReversible: false },
  { id: 'othala',   unicodeSymbol: 'ᛟ', isReversible: false },
  { id: 'blank',    unicodeSymbol: '◻', isReversible: false },
];
```

- [ ] **Step 2: Delete runes.ts** (superseded — no longer referenced)

```bash
git rm runes.ts
```

- [ ] **Step 3: Commit**

```bash
git add js/runes.js
git commit -m "feat: add js/runes.js, remove runes.ts"
```

---

## Task 2: Create `js/locales.js`

All locale-specific display strings: UI labels in EN/UA, and all 25 rune names/keywords/uprightMeaning in both languages.

**Files:**
- Create: `js/locales.js`

- [ ] **Step 1: Create js/locales.js**

```js
// js/locales.js
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
    runes: {
      fehu: {
        name: 'Fehu',
        keywords: ['abundance', 'wealth', 'fertility', 'new beginnings'],
        uprightMeaning: "Fehu speaks of cattle — the ancient measure of wealth — and carries the energy of abundance in motion. This is not idle gold locked in a vault, but living, breathing prosperity that grows, multiplies, and flows. When Fehu appears, resources are available to you: financial opportunity, creative energy, or the raw material from which something new can be built. It asks you to receive without shame and to steward what comes with care. Wealth gathered and never shared stagnates; wealth circulated returns enriched. Consider where in your life abundance is trying to reach you, and whether you are open to receiving it. Fehu also marks fertile beginnings — a new venture, a new relationship, a new phase of life. The energy is generative. Act while the soil is warm.",
      },
      uruz: {
        name: 'Uruz',
        keywords: ['strength', 'vitality', 'endurance', 'health'],
        uprightMeaning: "Uruz is the wild ox — immense, untamed, and full of vital force. This rune carries the energy of raw physical and inner strength, the kind that does not ask permission and does not negotiate with weakness. When Uruz appears, something powerful is moving in your life or within you. A period of difficulty may be ending, replaced by a surge of health, confidence, or momentum. Your body may be asking for more activity, more challenge; your spirit may be ready to take on something that once seemed too large. Trust your instincts. Move boldly. You are more capable than you have allowed yourself to believe.",
      },
      thurisaz: {
        name: 'Thurisaz',
        keywords: ['protection', 'threshold', 'conflict', 'defense'],
        uprightMeaning: "Thurisaz is the thorn — the gate-guardian, the force that both wounds and protects. It marks a threshold between what was and what is to come. This rune does not smooth over difficulty. Instead, it places you at the edge of something that demands a choice. A conflict may be unavoidable, a confrontation necessary, an old pattern requiring a decisive break. Thurisaz can also appear as protection — a warning to pause before crossing a boundary, or a shield against forces that mean you harm. If you are about to make a major decision, this rune counsels: look carefully before you step through. Not everything waiting on the other side is as it appears. The thorn guards the rose.",
      },
      ansuz: {
        name: 'Ansuz',
        keywords: ['communication', 'wisdom', 'signals', 'messages'],
        uprightMeaning: "Ansuz carries the breath of Odin — the divine word, the message, the signal. This rune is about communication in its deepest sense: not just speaking, but listening. Something is trying to reach you. A conversation may carry more meaning than its surface words suggest; a dream, a repeated encounter, a feeling in the gut — these are channels. Ansuz calls you to pay attention, to listen with more than your ears. It also governs your own voice: this is a favorable time to speak truth, to write, to teach, or to reach out to someone you have been putting off. Clarity is available. The transmission is clear if you tune in.",
      },
      raidho: {
        name: 'Raidho',
        keywords: ['journey', 'movement', 'right action', 'rhythm'],
        uprightMeaning: "Raidho is the wheel — the journey, both literal and inner. It speaks of movement that is purposeful and aligned, of being in the right place at the right time because you are moving with the rhythm of your own life rather than against it. If travel is on your horizon, Raidho blesses it. If you are navigating a long project or process, this rune signals that you are on track and the path ahead is open. It is also a rune of right action — doing the thing that must be done, in the right order, at the right time. There is a natural rhythm to events, and Raidho invites you to find it rather than forcing your own tempo.",
      },
      kenaz: {
        name: 'Kenaz',
        keywords: ['clarity', 'creativity', 'illumination', 'craft'],
        uprightMeaning: "Kenaz is the torch held aloft in the dark — the creative fire, the craft well practiced, the moment when confusion gives way to clarity. This rune marks a time of illumination. Something that was murky is becoming clear; something you have been trying to create is finding its form. Kenaz favors all creative work — writing, building, designing, problem-solving — and encourages you to bring your full attention and skill to whatever you are making. It is also the fire of intimacy: the warm light shared between people who genuinely see one another. The torch of Kenaz is meant to illuminate, not to consume. Use your fire with intention.",
      },
      gebo: {
        name: 'Gebo',
        keywords: ['gift', 'exchange', 'generosity', 'partnership'],
        uprightMeaning: "Gebo is the mark of the gift — and in the old Norse understanding, a gift always creates a bond. This rune speaks of exchange in its most balanced form: giving and receiving held in equal measure. It may mark the arrival of a genuine gift, an opportunity, or a partnership that is rooted in mutual respect and fair exchange. It is also a reminder that receiving is not weakness; to refuse a gift graciously offered is to break the circuit of generosity. Where in your life is a genuine exchange of value happening? Honor it.",
      },
      wunjo: {
        name: 'Wunjo',
        keywords: ['joy', 'harmony', 'belonging', 'fulfillment'],
        uprightMeaning: "Wunjo is joy — the deep, settled kind that comes not from excitement but from being exactly where you belong. This rune marks a time of harmony, of things coming together in a way that feels right and earned. The conflict that has been grinding you down may ease; a relationship may deepen into genuine warmth; a long effort may finally show its fruit. Wunjo is also the joy of community, of being part of something larger than yourself, of shared purpose and belonging. Do not dismiss this moment. Happiness, when it arrives, deserves to be fully inhabited. Let yourself be content.",
      },
      hagalaz: {
        name: 'Hagalaz',
        keywords: ['disruption', 'hail', 'transformation', 'crisis'],
        uprightMeaning: "Hagalaz is hail — sudden, destructive, and utterly impersonal. This rune does not negotiate and does not warn you twice. It marks the arrival of a disruption that is outside your control: circumstances shifting forcefully, plans upended, something broken that you cannot fix by will alone. The hailstorm does not hate the crop it damages; it simply falls. What matters is what you do in the aftermath. Hagalaz, though harsh, carries within it the seed of transformation — the old must sometimes be shattered for the new to emerge. Do not try to stop what is already in motion. Seek shelter, wait out the storm, and begin again when the ground is clear.",
      },
      nauthiz: {
        name: 'Nauthiz',
        keywords: ['need', 'constraint', 'patience', 'necessity'],
        uprightMeaning: "Nauthiz is the need-fire — the friction that produces flame. It speaks of constraint, limitation, and the very real experience of not having enough: not enough time, resources, freedom, or support. But Nauthiz is not merely about suffering — it is about what necessity teaches. Constraint is a forge. The things you build under limitation are often stronger than the things built in abundance, because scarcity demands ingenuity and patience. If you are struggling, do not look away from the struggle. Look at what it is teaching you. There is also a warning here: do not act impulsively from a place of need. Desperation drives poor decisions. The fire is inside you already.",
      },
      isa: {
        name: 'Isa',
        keywords: ['stillness', 'pause', 'ice', 'clarity'],
        uprightMeaning: "Isa is ice — still, silent, and crystalline. The river has stopped flowing, and nothing is moving forward right now. This is not failure; it is winter. Isa asks you to stop pushing, stop forcing, and simply be still. There is wisdom in the pause that cannot be found in motion. The ice preserves as well as halts; what is frozen is also held. If your plans are stalled, your relationships feel cold, or your creative well has run dry — welcome the stillness rather than fighting it. Use this time for reflection, for inner work, for examining what you actually want once the thaw comes.",
      },
      jera: {
        name: 'Jera',
        keywords: ['harvest', 'cycle', 'patience', 'reward'],
        uprightMeaning: "Jera is the year — the full cycle from planting to harvest. This rune speaks of natural timing: good things do not arrive out of season. If you have been working steadily toward something, Jera is a deeply welcome sign: the harvest is coming. The effort you have put in — the long hours, the careful tending, the patience when results were invisible — is about to bear fruit. This is not luck. It is consequence. At the same time, Jera reminds you that the cycle does not end at harvest: the field must rest, the seeds must be saved, the next planting must be planned. Celebrate what is coming, then turn your mind to what comes after.",
      },
      eihwaz: {
        name: 'Eihwaz',
        keywords: ['endurance', 'depth', 'the axis', 'resilience'],
        uprightMeaning: "Eihwaz is the yew — the tree that lives for millennia, that bends without breaking, that reaches simultaneously into earth and sky. This rune speaks of endurance rooted in depth: the ability to withstand what would break lesser things, not through hardness, but through flexibility and deep rootedness. Eihwaz appears when you are being tested in ways that feel like too much — and it says: you are more resilient than you know. It also marks the axis between worlds, the liminal space where transformation happens. Something in you is changing at a fundamental level. This process cannot be hurried. Go deep into your roots and hold on.",
      },
      perthro: {
        name: 'Perthro',
        keywords: ['mystery', 'chance', 'hidden knowledge', 'fate'],
        uprightMeaning: "Perthro is the dice cup — upturned, concealing its contents until the moment of reveal. This is the rune of mystery, of the unknown, of the things that are happening beneath the surface of visible events. Something is in play that you cannot yet see or fully understand, and Perthro counsels you to make peace with that uncertainty. There is also an invitation here to explore: to go deeper into your own hidden landscape, to examine what you have kept secret even from yourself. Mystery is not the enemy of understanding — it is the doorway. What is still concealed may be the most important thing about the situation.",
      },
      algiz: {
        name: 'Algiz',
        keywords: ['protection', 'sanctuary', 'guardian', 'instinct'],
        uprightMeaning: "Algiz is the elk-sedge — a plant with razor edges that cuts anyone who grabs it carelessly, protecting the marshy ground it grows in. This rune speaks of protection, both given and received. Your instincts are sharp right now; trust them. If something feels wrong, it probably is. Algiz also marks a time when guardianship and mentorship are relevant — either you are in a position to protect or guide someone else, or you need to seek out someone who can offer you that shelter. There is a sanctuary available to you. You do not have to face this alone.",
      },
      sowilo: {
        name: 'Sowilo',
        keywords: ['sun', 'success', 'vitality', 'wholeness'],
        uprightMeaning: "Sowilo is the sun — the force of clarity, vitality, and will that cannot be stopped. This rune is pure directional energy: pointing toward success, toward health, toward the realization of what you have been working for. When Sowilo appears, the light is on your side. A goal you have been pursuing may be closer than it appears; a health concern may be turning a corner; a sense of purpose and personal power may be returning after a period of shadow. Sowilo also marks the moment when you understand yourself more clearly — when the fog lifts and you can see who you actually are and what you are actually for. Claim your light.",
      },
      tiwaz: {
        name: 'Tiwaz',
        keywords: ['justice', 'sacrifice', 'honor', 'victory'],
        uprightMeaning: "Tiwaz is Tyr's rune — the sky god who sacrificed his hand to bind the great wolf, for the good of all. This rune speaks of justice, of doing what is right even when the personal cost is real. There is a battle or conflict ahead, or perhaps already underway, and Tiwaz says: fight for what is true and right, not merely for what benefits you. Honor matters. Integrity matters. The outcome of this situation will be shaped by whether all parties act with honesty and fairness. Tiwaz also marks the warrior spirit: courage, discipline, and the willingness to make necessary sacrifices. Victory is possible, but it must be earned rightly.",
      },
      berkano: {
        name: 'Berkano',
        keywords: ['birth', 'nurturing', 'growth', 'new life'],
        uprightMeaning: "Berkano is the birch — one of the first trees to return after the long winter, full of the vitality of new growth. This rune governs birth in all its forms: the birth of a child, a project, a relationship, a creative work, a new phase of life. It is also the rune of nurturing — the patient, sustained care that turns a seed into a living thing. Something new is beginning in your life, and it needs your attention, warmth, and protection. This is not the time for grand gestures; it is the time for consistent, gentle tending. Whatever you are growing, it is alive. Feed it well.",
      },
      ehwaz: {
        name: 'Ehwaz',
        keywords: ['partnership', 'movement', 'trust', 'cooperation'],
        uprightMeaning: "Ehwaz is the horse — and specifically the relationship between horse and rider, built on trust, communication, and mutual respect. Neither dominates; both must cooperate for the journey to succeed. This rune speaks of partnership in all its forms: a business collaboration, a marriage, a friendship, a working team. The relationship at the center of your question is one where true cooperation is possible — or necessary. Ehwaz also signals movement and travel: things are progressing, shifting, and there is an energy of momentum available if you work with those around you rather than against them. Trust the partnership. The horse knows the terrain.",
      },
      mannaz: {
        name: 'Mannaz',
        keywords: ['humanity', 'self', 'community', 'the mind'],
        uprightMeaning: "Mannaz is the human — both the self and the community, the individual and the collective. This rune asks you to consider yourself honestly: not with pride or shame, but with clear-eyed recognition of what you are — capable, fallible, connected, and distinct. It is also the rune of the social world: your place within your community, the roles you play, how you are perceived and how you perceive others. At its best, Mannaz points to a moment of genuine self-knowledge and social harmony. You understand yourself a little better than you did before. This understanding is the foundation for right action.",
      },
      laguz: {
        name: 'Laguz',
        keywords: ['water', 'intuition', 'flow', 'the unconscious'],
        uprightMeaning: "Laguz is water — the lake, the river, the deep well. It speaks of intuition, of the emotional body, of everything that moves beneath the rational surface. If you have been relying too heavily on logic and planning, Laguz invites you to feel your way forward. Your gut knows things your mind has not yet articulated. Dreams may be particularly informative right now. There is also an element of flow: stop fighting the current and let the water carry you. The path of least resistance is not always the path of laziness — sometimes it is the path of wisdom.",
      },
      ingwaz: {
        name: 'Ingwaz',
        keywords: ['completion', 'gestation', 'inner work', 'readiness'],
        uprightMeaning: "Ingwaz is the seed in the ground — full of potential, complete in itself, waiting for the right moment to emerge. This rune speaks of an inner completion: something within you has reached a point of readiness, of wholeness that does not yet need to be shown to the world. You may be in a period of deep inner work, of gestation, of gathering your forces before a significant emergence. This is not inaction — it is preparation. The seed does not need to explain itself while it is germinating. Trust the process. The breakthrough, when it comes, will simply be visible.",
      },
      dagaz: {
        name: 'Dagaz',
        keywords: ['dawn', 'breakthrough', 'transformation', 'clarity'],
        uprightMeaning: "Dagaz is the dawn — the moment when darkness gives way to light, when what was hidden becomes suddenly, irreversibly visible. This rune marks a breakthrough: a shift so significant that things cannot go back to the way they were. It may be an insight that changes how you see everything, a moment of genuine transformation, a door opening onto a fundamentally different chapter of life. Dagaz is not subtle. When this rune appears, something is changing at the root. Welcome it. The dawn does not care whether you are ready — it comes regardless. What it offers is clarity, and clarity is always a gift.",
      },
      othala: {
        name: 'Othala',
        keywords: ['heritage', 'home', 'inheritance', 'belonging'],
        uprightMeaning: "Othala is the ancestral enclosure — the home place, the inherited land, the legacy that comes before and after you. This rune speaks of what you carry from your lineage: the gifts, the patterns, the wounds, the wisdom. It also speaks of home in the fullest sense — not just a building, but a sense of belonging and rootedness that makes you who you are. There may be family matters on your horizon that deserve attention. There may also be gifts of tradition — skills, knowledge, or perspectives passed down — that are available to you right now if you claim them. What do you carry that is truly yours?",
      },
      blank: {
        name: 'Odin',
        keywords: ['the unknown', 'fate', 'surrender', 'the void'],
        uprightMeaning: "The Blank Rune is Odin's rune — the rune of the unknowable, of the moment before form, of the question that has no answer yet. When you draw the Blank Rune, you are invited to sit with uncertainty. The universe is not withholding information from you to be cruel — it is asking you to trust the unfolding without needing to know how it ends. There is a great freedom in accepting that you do not know. Release the need to control the outcome. Be present. The answer will come, in its own form, in its own time.",
      },
    },
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
    runes: {
      fehu: {
        name: 'Фехо',
        keywords: ['достаток', 'багатство', 'родючість', 'нові початки'],
        uprightMeaning: "Фехо говорить про худобу — давній мірило достатку — і несе енергію процвітання в русі. Це не мертве золото у сховищі, а жива, тріпотлива заможність, що росте, множиться й тече. Коли Фехо з'являється, ресурси доступні вам: фінансові можливості, творча енергія або матеріал, з якого можна збудувати щось нове. Ця руна закликає приймати без сорому й дбайливо розпоряджатися тим, що приходить. Багатство, зібране й ніколи не передане далі, застоюється; багатство, що циркулює, повертається збагаченим. Фехо також відзначає родючі початки — новий задум, нові стосунки, новий етап життя. Енергія породжує. Дійте, поки ґрунт теплий.",
      },
      uruz: {
        name: 'Уруз',
        keywords: ['сила', 'життєвість', 'витривалість', "здоров'я"],
        uprightMeaning: "Уруз — дикий бик, величезний, необуздний і сповнений живої сили. Ця руна несе енергію сирої фізичної та внутрішньої міці, яка не просить дозволу й не домовляється зі слабкістю. Коли Уруз з'являється, щось потужне рухається у вашому житті або всередині вас. Важкий період може закінчуватися, поступаючись місцем припливу здоров'я, впевненості та імпульсу. Ваше тіло може просити більшого навантаження; ваш дух може бути готовий прийняти те, що колись здавалося надто великим. Довіряйте своїм інстинктам. Рухайтеся сміливо. Ви здатні на більше, ніж дозволяли собі вірити.",
      },
      thurisaz: {
        name: 'Турісаз',
        keywords: ['захист', 'поріг', 'конфлікт', 'оборона'],
        uprightMeaning: "Турісаз — це шип, охоронець воріт, сила, що водночас ранить і захищає. Він позначає поріг між тим, що було, і тим, що має прийти. Ця руна не згладжує труднощі — натомість вона ставить вас на межу чогось, що вимагає вибору. Конфлікт може бути неминучим, протистояння необхідним, стара звичка — такою, що потребує рішучого розриву. Турісаз може також з'являтися як захист: попередження зупинитися перед тим, як перетнути межу. Якщо ви збираєтеся прийняти важливе рішення — ця руна радить: подивіться уважно, перш ніж зробити крок. Не все, що чекає по інший бік, є таким, яким видається. Шип охороняє троянду.",
      },
      ansuz: {
        name: 'Ансуз',
        keywords: ['комунікація', 'мудрість', 'сигнали', 'послання'],
        uprightMeaning: "Ансуз несе подих Одіна — божественне слово, послання, сигнал. Ця руна про спілкування в його найглибшому сенсі: не лише говорити, а й слухати. Щось намагається достукатися до вас. Розмова може нести більше сенсу, ніж її поверхневі слова; сон, повторювана зустріч, відчуття в животі — все це канали. Ансуз закликає вас бути уважним, слухати більше ніж вухами. Це також сприятливий час, щоб говорити правду, писати, навчати або зв'язатися з кимось, кого ви відкладали. Ясність доступна. Передача чиста, якщо ви налаштуєтеся.",
      },
      raidho: {
        name: 'Райдо',
        keywords: ['подорож', 'рух', 'правильна дія', 'ритм'],
        uprightMeaning: "Райдо — колесо, подорож як буквальна, так і внутрішня. Ця руна говорить про рух, що є цілеспрямованим і узгодженим: бути в правильному місці в правильний час, тому що ви рухаєтеся в ритмі свого власного життя, а не проти нього. Якщо подорож на горизонті — Райдо благословляє її. Якщо ви рухаєтеся через тривалий проект — ця руна сигналізує, що ви на правильному шляху. Це також руна правильної дії: робити те, що потрібно, в правильному порядку, в правильний час. Є природний ритм у подіях, і Райдо запрошує вас знайти його, а не нав'язувати свій темп.",
      },
      kenaz: {
        name: 'Кеназ',
        keywords: ['ясність', 'творчість', 'просвітлення', 'майстерність'],
        uprightMeaning: "Кеназ — смолоскип, піднятий у темряві: творчий вогонь, добре відпрацьоване ремесло, момент, коли плутанина поступається ясності. Ця руна позначає час просвітлення. Щось туманне стає зрозумілим; щось, що ви намагалися створити, набуває форми. Кеназ сприяє всій творчій роботі — написанню, будівництву, проектуванню, вирішенню проблем — і заохочує вас вкласти всю свою увагу та майстерність у те, що ви створюєте. Це також вогонь близькості: тепле світло, яким діляться люди, що справді бачать одне одного. Смолоскип Кеназа призначений для освітлення, а не для спалення. Використовуйте свій вогонь з наміром.",
      },
      gebo: {
        name: 'Гебо',
        keywords: ['дар', 'обмін', 'щедрість', 'партнерство'],
        uprightMeaning: "Гебо — знак дару. У давньонорвезькому розумінні дар завжди створює зв'язок. Ця руна говорить про обмін у його найбільш збалансованій формі: давати й отримувати у рівній мірі. Вона може позначати прихід справжнього дару, можливості або партнерства, що ґрунтується на взаємній повазі й справедливому обміні. Гебо нагадує, що отримувати — не слабкість: відмовитися від ввічливо запропонованого дару означає перервати кругообіг щедрості. Де у вашому житті відбувається справжній обмін цінностями? Шануйте це.",
      },
      wunjo: {
        name: 'Вунйо',
        keywords: ['радість', 'гармонія', 'приналежність', 'задоволення'],
        uprightMeaning: "Вунйо — це радість, глибока, усталена, яка приходить не від збудження, а від відчуття, що ви саме там, де маєте бути. Ця руна позначає час гармонії, коли речі складаються так, як відчувається правильним і заробленим. Конфлікт, що виснажував вас, може вщухнути; стосунки можуть поглибитися до справжньої теплоти; довгі зусилля можуть нарешті принести плоди. Вунйо — це також радість спільноти, спільної мети й приналежності. Не відмахуйтеся від цього моменту. Щастя, коли воно приходить, заслуговує бути повністю прожитим.",
      },
      hagalaz: {
        name: 'Гагалаз',
        keywords: ['порушення', 'град', 'трансформація', 'криза'],
        uprightMeaning: "Гагалаз — це град: раптовий, руйнівний і цілком безособовий. Він позначає появу порушення, що виходить за межі вашого контролю: обставини різко змінюються, плани перекреслюються, щось зламано, що ви не можете виправити зусиллям волі. Градова буря не ненавидить урожай, який нищить; вона просто падає. Важливо те, що ви робите після. Гагалаз несе в собі зерно трансформації: старе іноді мусить бути зруйноване, щоб з'явилося нове. Не намагайтеся зупинити те, що вже в русі. Шукайте прихистку, перечекайте бурю й починайте знову, коли ґрунт стане чистим.",
      },
      nauthiz: {
        name: 'Наутіз',
        keywords: ['потреба', 'обмеження', 'терпіння', 'необхідність'],
        uprightMeaning: "Наутіз — вогонь потреби, тертя, що породжує полум'я. Ця руна говорить про обмеження й справжній досвід нестачі: часу, ресурсів, свободи або підтримки. Але Наутіз — не лише про страждання: він про те, чого навчає необхідність. Обмеження — це горно. Речі, побудовані в умовах нестачі, часто міцніші за ті, що побудовані в достатку, бо дефіцит вимагає винахідливості й терпіння. Якщо ви боретеся, не відводьте погляд від боротьби. Подивіться, чому вона вас вчить. Є також попередження: не дійте імпульсивно з місця потреби. Вогонь вже всередині вас.",
      },
      isa: {
        name: 'Іса',
        keywords: ['спокій', 'пауза', 'лід', 'ясність'],
        uprightMeaning: "Іса — це лід: тихий, нерухомий і кристальний. Річка перестала текти, і зараз нічого не рухається вперед. Це не невдача; це зима. Іса просить вас зупинити напір, перестати форсувати й просто бути в спокої. У паузі є мудрість, яку не знайти в русі. Лід зберігає так само, як і зупиняє; те, що заморожено, також утримується. Якщо ваші плани загальмовані, стосунки здаються холодними, або творче джерело висохло — прийміть нерухомість, а не боріться з нею. Використайте цей час для роздумів і внутрішньої роботи.",
      },
      jera: {
        name: 'Єра',
        keywords: ['жнива', 'цикл', 'терпіння', 'винагорода'],
        uprightMeaning: "Єра — це рік, повний цикл від посіву до жнив. Ця руна говорить про природний час: добре не приходить не в сезон. Якщо ви наполегливо працювали до чогось, Єра — дуже бажаний знак: жнива наближаються. Зусилля, які ви вклали — довгі години, дбайливий догляд, терпіння, коли результати були невидимі — незабаром дадуть плоди. Це не удача. Це наслідок. Єра також нагадує, що цикл не закінчується на жнивах: поле мусить відпочити, насіння треба зберегти, наступний посів — планувати. Святкуйте те, що приходить, потім направте думку на те, що буде після.",
      },
      eihwaz: {
        name: 'Ейваз',
        keywords: ['витривалість', 'глибина', 'вісь', 'стійкість'],
        uprightMeaning: "Ейваз — тис, дерево, що живе тисячоліттями, гнеться й не ламається, тягнеться водночас у землю і в небо. Ця руна говорить про витривалість, укорінену в глибині: здатність витримати те, що зламало б слабшого, не через твердість, а через гнучкість і глибоке коріння. Ейваз з'являється, коли вас випробовують у спосіб, що здається надмірним, і каже: ви більш стійкі, ніж думаєте. Він також позначає вісь між світами, де відбувається трансформація. Щось у вас змінюється на фундаментальному рівні. Цей процес не можна прискорити. Заглибтеся у своє коріння й тримайтеся.",
      },
      perthro: {
        name: 'Пертро',
        keywords: ['таємниця', 'шанс', 'приховані знання', 'доля'],
        uprightMeaning: "Пертро — це кубок для кісток, перевернутий, що приховує свій вміст до моменту розкриття. Це руна таємниці, невідомого, речей, що відбуваються під поверхнею видимих подій. Щось відбувається, чого ви ще не можете побачити або повністю зрозуміти, і Пертро радить вам прийняти цю невизначеність. Є також запрошення досліджувати: заглибитися у власний прихований ландшафт, дослідити те, що ви приховували навіть від себе. Таємниця — не ворог розуміння, а двері до нього. Те, що ще приховано, може бути найважливішим у цій ситуації.",
      },
      algiz: {
        name: 'Алгіз',
        keywords: ['захист', 'притулок', 'охоронець', 'інстинкт'],
        uprightMeaning: "Алгіз — осока з гострими краями, що ріже кожного, хто бере її необережно, захищаючи болотистий ґрунт, де вона росте. Ця руна говорить про захист — і наданий, і отриманий. Ваші інстинкти зараз загострені; довіряйте їм. Якщо щось відчувається неправильним — воно, мабуть, неправильне. Алгіз також позначає час, коли актуальні наставництво й опіка: або ви в позиції захищати когось іншого, або вам потрібно шукати того, хто може запропонувати вам такий прихисток. Є притулок, доступний вам. Вам не треба стикатися з цим самотужки.",
      },
      sowilo: {
        name: 'Совіло',
        keywords: ['сонце', 'успіх', 'життєвість', 'цілісність'],
        uprightMeaning: "Совіло — сонце, сила ясності, життєвості та волі, яку не зупинити. Ця руна несе чисту спрямовану енергію: до успіху, до здоров'я, до здійснення того, над чим ви працювали. Коли Совіло з'являється, світло на вашому боці. Мета, до якої ви прагнули, може бути ближчою, ніж здається; відчуття мети й особистої сили може повертатися після тіньового періоду. Совіло також позначає момент, коли ви розумієте себе ясніше — коли туман розсіюється і ви можете бачити, хто ви є і для чого ви є. Заявіть своє світло.",
      },
      tiwaz: {
        name: 'Тіваз',
        keywords: ['справедливість', 'жертва', 'честь', 'перемога'],
        uprightMeaning: "Тіваз — руна Тюра, небесного бога, який пожертвував рукою, щоб зв'язати великого вовка заради блага всіх. Ця руна говорить про справедливість, про те, щоб робити правильне, навіть коли особиста ціна є реальною. Попереду є бій або конфлікт, і Тіваз каже: боріться за те, що є істинним і правильним, а не лише за те, що вигідне вам. Честь важлива. Цілісність важлива. Результат цієї ситуації залежатиме від того, чи всі сторони — і особливо ви — діятимуть з чесністю і справедливістю. Перемога можлива, але вона має бути здобута чесно.",
      },
      berkano: {
        name: 'Беркано',
        keywords: ['народження', 'виховання', 'зростання', 'нове життя'],
        uprightMeaning: "Беркано — береза, одне з перших дерев, що повертається після довгої зими, сповнене живої сили нового росту. Ця руна керує народженням у всіх його формах: народженням дитини, проекту, стосунків, творчої роботи, нового етапу життя. Це також руна виховання — терплячого, тривалого догляду, що перетворює насіння на живу істоту. Щось нове починається у вашому житті, і воно потребує вашої уваги, тепла й захисту. Зараз не час для великих жестів; це час для постійного, лагідного догляду. Те, що ви ростите, живе. Годуйте це добре.",
      },
      ehwaz: {
        name: 'Ехваз',
        keywords: ['партнерство', 'рух', 'довіра', 'співпраця'],
        uprightMeaning: "Ехваз — кінь і, зокрема, стосунки між конем і вершником, побудовані на довірі, спілкуванні й взаємній повазі. Жоден не домінує; обидва мусять співпрацювати, щоб подорож вдалась. Ця руна говорить про партнерство в усіх його формах: ділова співпраця, шлюб, дружба, робоча команда. Стосунки в центрі вашого питання — це ті, де справжня співпраця є можливою або необхідною. Ехваз також сигналізує про рух: речі просуваються, є енергія імпульсу, якщо ви працюєте з тими, хто поруч, а не проти них. Довіряйте партнерству. Кінь знає місцевість.",
      },
      mannaz: {
        name: 'Манназ',
        keywords: ['людяність', 'себе', 'спільнота', 'розум'],
        uprightMeaning: "Манназ — людина, як особистість, так і спільнота, як індивід, так і колектив. Ця руна просить вас розглянути себе чесно: не з гордістю чи соромом, а з ясним усвідомленням того, ким ви є — здатним, схильним до помилок, пов'язаним і неповторним. Це також руна соціального світу: ваше місце у спільноті, ролі, які ви відіграєте, як вас сприймають і як ви сприймаєте інших. У своєму найкращому прояві Манназ вказує на момент справжнього самопізнання й соціальної гармонії. Ви розумієте себе трохи краще, ніж раніше. Це розуміння є підґрунтям правильної дії.",
      },
      laguz: {
        name: 'Лагуз',
        keywords: ['вода', 'інтуїція', 'потік', 'підсвідомість'],
        uprightMeaning: "Лагуз — вода: озеро, річка, глибока криниця. Ця руна говорить про інтуїцію, про емоційне тіло, про все, що рухається під раціональною поверхнею. Якщо ви занадто покладалися на логіку й планування, Лагуз запрошує вас відчути шлях наперед. Ваш внутрішній голос знає те, чого ваш розум ще не сформулював. Сни можуть бути особливо інформативними зараз. Є також елемент потоку: перестаньте боротися з течією й дозвольте воді нести вас. Шлях найменшого опору не завжди є шляхом лінощів — іноді це шлях мудрості.",
      },
      ingwaz: {
        name: 'Інгваз',
        keywords: ['завершення', 'визрівання', 'внутрішня робота', 'готовність'],
        uprightMeaning: "Інгваз — насіння в землі: повне потенціалу, завершене саме в собі, що чекає правильного моменту, щоб проростати. Ця руна говорить про внутрішнє завершення: щось у вас досягло точки готовності, цілісності, яку ще не потрібно показувати світу. Можливо, ви перебуваєте в глибокій внутрішній роботі, у визріванні, збираючи сили перед значним проявом. Це не бездіяльність — це підготовка. Насінню не потрібно пояснювати себе, поки воно проростає. Довіряйте процесу. Прорив, коли він прийде, просто стане видимим.",
      },
      dagaz: {
        name: 'Дагаз',
        keywords: ['світанок', 'прорив', 'трансформація', 'ясність'],
        uprightMeaning: "Дагаз — це світанок, момент, коли темрява поступається світлу, коли приховане стає раптово, безповоротно видимим. Ця руна позначає прорив: зрушення настільки значне, що речі не можуть повернутися до того, якими були. Це може бути осяяння, що змінює ваш погляд на все, момент справжньої трансформації, двері, що відчиняються у принципово інший розділ життя. Дагаз не є тонким. Коли ця руна з'являється, щось змінюється в корені. Прийміть це. Світанок не запитує, чи готові ви — він приходить незалежно від цього. Те, що він пропонує — це ясність, а ясність завжди є даром.",
      },
      othala: {
        name: 'Отала',
        keywords: ['спадщина', 'дім', 'успадкування', 'приналежність'],
        uprightMeaning: "Отала — це родовий обійстя, рідне місце, успадкована земля, спадщина, що передує вам і переживе вас. Ця руна говорить про те, що ви несете зі свого роду: дари, зразки, рани, мудрість. Вона також говорить про дім у повному сенсі — не просто будівлю, а відчуття приналежності й укоріненості, що робить вас тим, ким ви є. Можуть бути сімейні справи на горизонті, що заслуговують уваги. Є також дари традиції — навички, знання або погляди, передані у спадок, — які доступні вам зараз, якщо ви їх заявите. Що з того, що ви несете, справді ваше?",
      },
      blank: {
        name: 'Одін',
        keywords: ['невідоме', 'доля', 'покора', 'порожнеча'],
        uprightMeaning: "Порожня Руна — це руна Одіна, руна незбагненного, моменту до форми, питання, що ще не має відповіді. Деякі традиції не включають її до набору Старшого Футарку, і її присутність тут сама по собі є певним висловлюванням: не все можна прочитати. Коли ви тягнете Порожню Руну, вас запрошують сидіти з невизначеністю. Всесвіт не приховує від вас інформацію, щоб бути жорстоким — він просить вас довіряти розгортанню, не знаючи, чим воно закінчиться. Є велика свобода в прийнятті того, що ви не знаєте. Відпустіть потребу контролювати результат. Будьте присутні. Відповідь прийде у своєму часі.",
      },
    },
  },
};
```

- [ ] **Step 2: Verify all 25 rune keys exist in both `en.runes` and `ua.runes`**

Open a browser console and run:
```js
// paste into DevTools console after loading index.html (once rewritten)
// or just visually count: fehu uruz thurisaz ansuz raidho kenaz gebo wunjo
// hagalaz nauthiz isa jera eihwaz perthro algiz sowilo tiwaz berkano
// ehwaz mannaz laguz ingwaz dagaz othala blank = 25
```

Expected: 25 keys in each locale.

- [ ] **Step 3: Commit**

```bash
git add js/locales.js
git commit -m "feat: add js/locales.js with EN/UA translations for all 25 runes"
```

---

## Task 3: Create `js/rune-engine.js`

Locale-agnostic daily rune selector. Same deterministic algorithm as the original site.

**Files:**
- Create: `js/rune-engine.js`

- [ ] **Step 1: Create js/rune-engine.js**

```js
// js/rune-engine.js
import { RUNES } from './runes.js';

// Same algorithm as original: day-of-year mod array length.
// Returns a rune id string. Same rune for all users on the same calendar day.
export function getDailyRune() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86_400_000);
  return RUNES[dayOfYear % RUNES.length].id;
}
```

- [ ] **Step 2: Commit**

```bash
git add js/rune-engine.js
git commit -m "feat: add js/rune-engine.js"
```

---

## Task 4: Create `css/styles.css`

Extract all existing styles from `index.html` and add: locale toggle, scroll-reveal, Apple badge, reduced-motion media query, locale fade.

**Files:**
- Create: `css/styles.css`

- [ ] **Step 1: Create css/styles.css**

```css
/* css/styles.css */
:root {
  --bg:     #1a1410;
  --stone:  #2d2820;
  --glyph:  #e8dcc8;
  --accent: #c8873a;
  --text:   #f0e8d8;
  --muted:  #a09080;
  --border: #3d3830;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: Georgia, 'Times New Roman', serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* faint runic wallpaper */
body::before {
  content: 'ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ';
  position: fixed;
  inset: 0;
  font-size: 20px;
  letter-spacing: 10px;
  line-height: 3;
  color: rgba(200,135,58,0.035);
  pointer-events: none;
  z-index: 0;
  padding: 24px;
  word-break: break-all;
}

.page {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: 40px 24px 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── Header ── */
.app-header {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.locale-toggle {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.locale-btn {
  background: none;
  border: none;
  font-family: Georgia, serif;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  cursor: pointer;
  padding: 4px 2px;
  transition: color 0.2s;
}
.locale-btn.active { color: var(--accent); }
.locale-btn:hover:not(.active) { color: var(--text); }

.locale-sep {
  font-size: 11px;
  color: var(--border);
}

.app-title {
  font-size: 40px;
  font-weight: normal;
  color: var(--text);
  letter-spacing: 1px;
  text-align: center;
  margin-top: 16px;
}
.app-subtitle {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 3.5px;
  text-transform: uppercase;
  text-align: center;
  margin-top: 8px;
}
.date-label {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 12px;
}

/* ── Flip card ── */
.card-container {
  perspective: 1000px;
  width: 190px;
  height: 230px;
  cursor: pointer;
  margin-bottom: 28px;
  flex-shrink: 0;
}
.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.75s cubic-bezier(0.4, 0, 0.2, 1);
}
.card.flipped { transform: rotateY(180deg); }

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 8px;
  background: var(--stone);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.card-front { transform: rotateY(180deg); }

.card-back-glyph {
  font-size: 72px;
  color: var(--border);
  user-select: none;
  line-height: 1;
}
.card-back-label {
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

.rune-glyph {
  font-size: 96px;
  color: var(--glyph);
  line-height: 1;
  user-select: none;
}
.rune-name-card {
  font-size: 14px;
  color: var(--accent);
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

/* ── Reveal button ── */
.reveal-btn {
  background: var(--stone);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  font-family: Georgia, serif;
  font-size: 17px;
  letter-spacing: 1px;
  padding: 17px 0;
  cursor: pointer;
  width: 100%;
  max-width: 320px;
  margin-bottom: 36px;
  transition: border-color 0.2s, background 0.2s, opacity 0.2s;
}
.reveal-btn:hover:not(:disabled) {
  background: #332d26;
  border-color: var(--accent);
}
.reveal-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

/* ── Meaning card ── */
.meaning-card {
  background: var(--stone);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 28px 24px;
  width: 100%;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.55s ease 0.35s, transform 0.55s ease 0.35s;
  pointer-events: none;
}
.meaning-card.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 18px;
}
.keyword {
  font-size: 10px;
  color: var(--accent);
  letter-spacing: 2px;
  text-transform: uppercase;
  background: rgba(200,135,58,0.09);
  border: 1px solid rgba(200,135,58,0.22);
  border-radius: 3px;
  padding: 3px 8px;
}
.meaning-text {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text);
}

/* ── Divider ── */
.divider {
  width: 48px;
  height: 1px;
  background: var(--border);
  margin: 44px 0;
}

/* ── Download section ── */
.download-section {
  text-align: center;
  width: 100%;
}
.download-label {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.app-store-badge {
  display: block;
  width: 160px;
  margin: 0 auto;
}
.app-store-badge img {
  width: 100%;
  height: auto;
}

/* ── Footer ── */
.footer-nav {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}
.footer-nav a {
  font-size: 11px;
  color: var(--muted);
  text-decoration: none;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: color 0.2s;
}
.footer-nav a:hover { color: var(--accent); }

/* ── Scroll-reveal sections ── */
.reveal-section {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.reveal-section.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
  .meaning-card { transition: none; }
  .reveal-section { transition: none; opacity: 1; transform: none; }
  .reveal-btn { transition: none; }
  .locale-btn { transition: none; }
  .footer-nav a { transition: none; }
}
```

- [ ] **Step 2: Commit**

```bash
git add css/styles.css
git commit -m "feat: add css/styles.css with locale toggle, scroll-reveal, badge styles"
```

---

## Task 5: Create `js/ui.js`

The `UI` class owns all DOM interaction. It reads from `LOCALES` and `RUNES` but never touches `localStorage` or `getDailyRune()` — that's `app.js`'s job.

**Files:**
- Create: `js/ui.js`

- [ ] **Step 1: Create js/ui.js**

```js
// js/ui.js
import { RUNES } from './runes.js';
import { LOCALES } from './locales.js';

export class UI {
  constructor() {
    this.appTitle     = document.getElementById('appTitle');
    this.appSubtitle  = document.getElementById('appSubtitle');
    this.dateLabel    = document.getElementById('dateLabel');
    this.localeBtnEn  = document.getElementById('localeBtnEn');
    this.localeBtnUa  = document.getElementById('localeBtnUa');
    this.card         = document.getElementById('card');
    this.cardBackLabel = document.getElementById('cardBackLabel');
    this.runeGlyph    = document.getElementById('runeGlyph');
    this.runeNameCard = document.getElementById('runeNameCard');
    this.revealBtn    = document.getElementById('revealBtn');
    this.meaningCard  = document.getElementById('meaningCard');
    this.keywords     = document.getElementById('keywords');
    this.meaningText  = document.getElementById('meaningText');
    this.downloadLabel = document.getElementById('downloadLabel');
    this.footerPrivacy = document.getElementById('footerPrivacy');
    this.footerSupport = document.getElementById('footerSupport');
    this.footerTerms  = document.getElementById('footerTerms');

    this._runeId  = null;
    this._locale  = 'en';
    this._revealed = false;
  }

  // Populate all text content for the given runeId and locale.
  // Safe to call before or after reveal.
  render(runeId, locale) {
    this._runeId = runeId;
    this._locale = locale;

    const strings = LOCALES[locale];
    const runeData = RUNES.find(r => r.id === runeId);
    const runeStrings = strings.runes[runeId];

    // Header
    this.appTitle.textContent    = strings.appTitle;
    this.appSubtitle.textContent = strings.subtitle;
    this.dateLabel.textContent   = this._formatDate(locale);

    // Locale toggle active state
    this.localeBtnEn.classList.toggle('active', locale === 'en');
    this.localeBtnUa.classList.toggle('active', locale === 'ua');

    // Card back label
    this.cardBackLabel.textContent = strings.tapToReveal;

    // Card front (glyph is locale-agnostic)
    this.runeGlyph.textContent    = runeData.unicodeSymbol;
    this.runeNameCard.textContent = runeStrings.name.toUpperCase();

    // Reveal button
    if (this._revealed) {
      this.revealBtn.textContent = strings.revealedBtn(runeStrings.name);
    } else {
      this.revealBtn.textContent = strings.revealBtn;
    }

    // Meaning card — re-render keywords and meaning text
    this.keywords.innerHTML = '';
    runeStrings.keywords.forEach(kw => {
      const span = document.createElement('span');
      span.className = 'keyword';
      span.textContent = kw;
      this.keywords.appendChild(span);
    });
    this.meaningText.textContent = runeStrings.uprightMeaning;

    // Download label + footer
    this.downloadLabel.textContent  = strings.downloadLabel;
    this.footerPrivacy.textContent  = strings.privacyPolicy;
    this.footerSupport.textContent  = strings.support;
    this.footerTerms.textContent    = strings.termsOfUse;
  }

  // Flip the card (one-way; idempotent if already flipped).
  flip() {
    this._revealed = true;
    this.card.classList.add('flipped');
    this.revealBtn.disabled = true;
    const runeStrings = LOCALES[this._locale].runes[this._runeId];
    this.revealBtn.textContent = LOCALES[this._locale].revealedBtn(runeStrings.name);
  }

  // Show the meaning card 500ms after flip.
  revealMeaning() {
    setTimeout(() => {
      this.meaningCard.classList.add('visible');
    }, 500);
  }

  // Fade out (200ms) → update text → fade in (200ms).
  switchLocale(locale) {
    const page = document.querySelector('.page');
    page.style.transition = 'opacity 0.2s';
    page.style.opacity = '0.3';

    setTimeout(() => {
      this.render(this._runeId, locale);
      page.style.opacity = '1';
      setTimeout(() => { page.style.transition = ''; }, 200);
    }, 200);
  }

  // IntersectionObserver on all .reveal-section elements.
  // Skipped entirely if prefers-reduced-motion is set.
  initScrollReveals() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-section').forEach(el => observer.observe(el));
  }

  _formatDate(locale) {
    return new Date().toLocaleDateString(
      locale === 'ua' ? 'uk-UA' : 'en-US',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add js/ui.js
git commit -m "feat: add js/ui.js UI class"
```

---

## Task 6: Download the Apple App Store badge SVG

The official Apple "Download on the App Store" badge must be sourced from Apple's official badge resource page. Do **not** invent or draw the SVG manually.

**Files:**
- Create: `assets/app-store-badge.svg`

- [ ] **Step 1: Create assets/ directory and download the badge**

```bash
mkdir -p assets
curl -L "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" \
  -o assets/app-store-badge.svg
```

If that URL returns a 404 or redirect, try:
```bash
curl -L "https://apple-resources.s3.amazonaws.com/media-badge/download-on-the-app-store/black/en-us.svg" \
  -o assets/app-store-badge.svg
```

Verify the file is non-empty and looks like an SVG (starts with `<svg` or `<?xml`):
```bash
head -3 assets/app-store-badge.svg
```

Expected: XML/SVG content, not an HTML error page.

- [ ] **Step 2: Commit**

```bash
git add assets/app-store-badge.svg
git commit -m "feat: add official Apple App Store badge SVG"
```

---

## Task 7: Rewrite `index.html`

Replace the monolithic file with a pure shell. All CSS moves to `css/styles.css`; all JS is loaded via `<script type="module" src="js/app.js">`. No inline JS or CSS.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="google-site-verification" content="WheYdMLT7Hkb3wq0LvasfSV_0bMPkwo0zTd48iychos" />
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="stylesheet" href="css/styles.css">
  <title>Daily Rune</title>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <header class="app-header">
      <div class="locale-toggle">
        <button class="locale-btn active" id="localeBtnEn" data-locale="en">EN</button>
        <span class="locale-sep">|</span>
        <button class="locale-btn" id="localeBtnUa" data-locale="ua">UA</button>
      </div>
      <h1 class="app-title" id="appTitle">Daily Rune</h1>
      <p class="app-subtitle" id="appSubtitle">Elder Futhark Divination</p>
      <p class="date-label" id="dateLabel"></p>
    </header>

    <!-- Flip card -->
    <div class="card-container" id="cardContainer" title="Reveal today's rune">
      <div class="card" id="card">
        <div class="card-face card-back">
          <span class="card-back-glyph">ᚠ</span>
          <span class="card-back-label" id="cardBackLabel">Tap to reveal</span>
        </div>
        <div class="card-face card-front">
          <span class="rune-glyph" id="runeGlyph"></span>
          <span class="rune-name-card" id="runeNameCard"></span>
        </div>
      </div>
    </div>

    <button class="reveal-btn" id="revealBtn">Reveal Today's Rune</button>

    <div class="meaning-card" id="meaningCard">
      <div class="keywords" id="keywords"></div>
      <p class="meaning-text" id="meaningText"></p>
    </div>

    <div class="divider"></div>

    <!-- Download CTA — scroll-reveal section -->
    <section class="download-section reveal-section" id="downloadSection">
      <p class="download-label" id="downloadLabel">Full readings in the app</p>
      <a class="app-store-badge"
         href="https://apps.apple.com/app/daily-rune/id6745174491"
         target="_blank"
         rel="noopener"
         aria-label="Download on the App Store">
        <img src="assets/app-store-badge.svg" alt="Download on the App Store">
      </a>
    </section>

    <div class="divider"></div>

    <!-- Footer — scroll-reveal section -->
    <nav class="footer-nav reveal-section">
      <a href="privacy-policy.html" id="footerPrivacy">Privacy Policy</a>
      <a href="support.html" id="footerSupport">Support</a>
      <a href="terms-of-use.html" id="footerTerms">Terms of Use</a>
    </nav>

  </div>

  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "refactor: rewrite index.html as module shell"
```

---

## Task 8: Create `js/app.js`

Entry point. Reads locale from `localStorage`, calls `getDailyRune()`, wires all events.

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: Create js/app.js**

```js
// js/app.js
import { getDailyRune } from './rune-engine.js';
import { UI } from './ui.js';

const locale = localStorage.getItem('locale') || 'en';
const runeId = getDailyRune();
const ui = new UI();

// Initial render
ui.render(runeId, locale);
ui.initScrollReveals();

// Reveal button + card click
let revealed = false;
function reveal() {
  if (revealed) return;
  revealed = true;
  ui.flip();
  ui.revealMeaning();
}

document.getElementById('revealBtn').addEventListener('click', reveal);
document.getElementById('cardContainer').addEventListener('click', reveal);

// Locale toggle
document.getElementById('localeBtnEn').addEventListener('click', () => {
  localStorage.setItem('locale', 'en');
  ui.switchLocale('en');
});
document.getElementById('localeBtnUa').addEventListener('click', () => {
  localStorage.setItem('locale', 'ua');
  ui.switchLocale('ua');
});
```

- [ ] **Step 2: Commit**

```bash
git add js/app.js
git commit -m "feat: add js/app.js entry point"
```

---

## Task 9: End-to-End Verification

**Files:** None (manual browser checks)

- [ ] **Step 1: Start a local server**

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

- [ ] **Step 2: Check EN locale on load**

Expected:
- Title: "Daily Rune"
- Subtitle: "Elder Futhark Divination"
- Date label shows today's date in English format (e.g., "Thursday, March 26, 2026")
- Card shows ᚠ glyph (or whichever is today's back-face placeholder)
- Button reads "Reveal Today's Rune"
- Download section shows Apple badge image (160px wide, centered)
- Footer shows "Privacy Policy · Support · Terms of Use"

- [ ] **Step 3: Test reveal interaction**

Click the button (or card).

Expected:
- Card flips (3D rotation, 0.75s)
- Button disables, shows rune name (e.g., "Fehu")
- After ~500ms, meaning card slides up with keywords + meaning text

- [ ] **Step 4: Switch to UA locale**

Click "UA" in the top-right toggle.

Expected:
- Page fades to 30% opacity, then back to 100% over ~400ms total
- "UA" button turns accent color, "EN" turns muted
- Title: "Щоденна Руна"
- Subtitle: "Ворожіння на рунах Старшого Футарку"
- Date in Ukrainian format (e.g., "четвер, 26 березня 2026 р.")
- If rune was already revealed: meaning card shows Ukrainian keywords + meaning
- Button shows rune name in Ukrainian (e.g., "Фехо")

- [ ] **Step 5: Test locale persistence**

Reload the page with UA locale active.

Expected: locale is still UA (read from localStorage).

- [ ] **Step 6: Test scroll reveal**

Scroll down past the flip-card section.

Expected: Download section and footer section fade in from below (opacity 0→1, translateY 16px→0, 0.5s).

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: complete daily rune site redesign — modular JS, EN/UA localization, App Store badge"
```

---

## Scope Coverage Self-Check

| Spec Requirement | Covered In |
|-----------------|-----------|
| Modular ES module JS architecture | Tasks 1–3, 5, 8 |
| EN/UA locale toggle with localStorage | Task 2, 5, 8 |
| All 25 rune meanings in Ukrainian | Task 2 |
| Locale switch fade transition (400ms total) | Task 5 (`switchLocale`) |
| Date with `Intl.DateTimeFormat` per locale | Task 5 (`_formatDate`) |
| Flip card (3D, 0.75s cubic-bezier) | Task 4 (CSS), Task 5 (`flip`) |
| Meaning card slide-up after 500ms | Task 5 (`revealMeaning`) |
| Official Apple App Store badge SVG | Task 6 |
| Badge links to App Store URL | Task 7 (HTML `href`) |
| Scroll-reveal via IntersectionObserver | Task 5 (`initScrollReveals`) |
| `prefers-reduced-motion` respected | Task 4 (CSS), Task 5 (`initScrollReveals`) |
| Zero build step, GitHub Pages compatible | All tasks (no bundler, plain ES modules) |
| Google Play removed | Task 7 (not in new HTML) |
