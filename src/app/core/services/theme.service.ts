import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type AppTheme = 'dark' | 'light' | 'violet';

interface ThemeOption {
  icon: string;
  label: string;
  value: AppTheme;
}

const STORAGE_KEY = 'timegrid-theme';

export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'dark', label: 'Tema escuro', icon: '☾' },
  { value: 'light', label: 'Tema claro', icon: '☀' },
  { value: 'violet', label: 'Tema violeta', icon: '♀' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);

  readonly currentTheme = signal<AppTheme>(this.readInitialTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);

    if (this.browser) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }

  nextTheme(): void {
    const options = THEME_OPTIONS.map((option) => option.value);
    const currentIndex = options.indexOf(this.currentTheme());
    const nextIndex = (currentIndex + 1) % options.length;

    this.setTheme(options[nextIndex]);
  }

  private readInitialTheme(): AppTheme {
    if (!this.browser) {
      return 'dark';
    }

    const storedTheme = localStorage.getItem(STORAGE_KEY);

    return this.isTheme(storedTheme) ? storedTheme : 'dark';
  }

  private isTheme(value: string | null): value is AppTheme {
    return value === 'dark' || value === 'light' || value === 'violet';
  }

  private applyTheme(theme: AppTheme): void {
    const root = this.document.documentElement;

    root.setAttribute('data-theme', theme);
    root.style.setProperty('color-scheme', theme === 'light' ? 'light' : 'dark');
  }
}
