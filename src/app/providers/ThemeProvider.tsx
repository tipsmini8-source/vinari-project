import { useEffect, type PropsWithChildren } from 'react';

import { useThemeStore } from '@shared/stores/theme-store';

export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);

    root.classList.toggle('dark', shouldUseDark);
    root.dataset.theme = theme;
  }, [theme]);

  return children;
}
