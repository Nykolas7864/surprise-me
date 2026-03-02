import { useCallback } from 'react';
import type { MediaCategory } from '../types/index.ts';
import { categoryThemes, defaultTheme } from '../utils/categoryThemes.ts';

export function useTheme() {
  const applyTheme = useCallback((category: MediaCategory | null) => {
    const root = document.documentElement;
    const theme = category && categoryThemes[category] ? categoryThemes[category] : defaultTheme;

    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-hover', theme.primaryHover);
    root.style.setProperty('--color-primary-muted', theme.primaryMuted);
    root.style.setProperty('--color-accent-light', theme.accentLight);
    root.style.setProperty('--color-accent-pale', theme.accentPale);
    root.style.setProperty('--color-gradient-from', theme.gradientFrom);
    root.style.setProperty('--color-gradient-to', theme.gradientTo);
    root.style.setProperty('--glass-rgb', theme.glassRgb);
    root.style.setProperty('--shimmer-light', theme.shimmerLight);
    root.style.setProperty('--shimmer-mid', theme.shimmerMid);
  }, []);

  const resetTheme = useCallback(() => {
    applyTheme(null);
  }, [applyTheme]);

  return { applyTheme, resetTheme };
}
