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
