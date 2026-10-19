import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { colors as lightColors } from '../theme';

export const darkColors = {
  ...lightColors,
  navy: '#e7f1ee',
  surface: '#101816',
  white: '#1b2926',
  muted: '#b7c9c2',
  border: '#2c403b',
};

type Palette = typeof lightColors;
type Mode = 'light' | 'dark';

interface ThemeValue {
  mode: Mode;
  colors: Palette;
  setDark: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeValue | undefined>(undefined);
const STORAGE_KEY = 'veriscreen-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('light');

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((value) => {
        if (value === 'dark') setMode('dark');
      })
      .catch(() => undefined);
  }, []);

  const setDark = useCallback((enabled: boolean) => {
    const next: Mode = enabled ? 'dark' : 'light';
    setMode(next);
    SecureStore.setItemAsync(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({ mode, colors: mode === 'dark' ? darkColors : lightColors, setDark }),
    [mode, setDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('ThemeProvider is missing');
  return value;
}
