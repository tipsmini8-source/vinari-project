import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@shared/ui/button';
import { useThemeStore, type ThemeMode } from '@shared/stores/theme-store';

const nextTheme: Record<ThemeMode, ThemeMode> = {
  system: 'light',
  light: 'dark',
  dark: 'system'
};

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <Button
      aria-label={`Ubah tema. Tema aktif: ${theme}`}
      size="icon"
      type="button"
      variant="ghost"
      onClick={() => {
        setTheme(nextTheme[theme]);
      }}
    >
      <Icon aria-hidden="true" className="size-5" />
    </Button>
  );
}
