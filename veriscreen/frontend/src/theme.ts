const STORAGE_KEY = 'veriscreen-theme';

export type ThemeMode = 'light' | 'dark';

export function readTheme(): ThemeMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle('theme-dark', mode === 'dark');
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* The page still switches for this visit. */
  }
}
