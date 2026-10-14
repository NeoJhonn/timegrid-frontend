import { Component, computed, inject } from '@angular/core';
import { THEME_OPTIONS, ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button
      type="button"
      class="theme-toggle grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-lg font-black text-slate-200 shadow-[0_12px_30px_rgba(15,23,42,0.12)] transition hover:border-emerald-300/40 hover:bg-white/10 hover:text-white active:scale-[0.98]"
      [attr.aria-label]="activeTheme().label + '. Clique para alternar tema.'"
      [title]="activeTheme().label"
      (click)="nextTheme()"
    >
      {{ activeTheme().icon }}
    </button>
  `,
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  protected readonly currentTheme = computed(() => this.themeService.currentTheme());
  protected readonly activeTheme = computed(
    () =>
      THEME_OPTIONS.find((theme) => theme.value === this.currentTheme()) ?? THEME_OPTIONS[0],
  );

  protected nextTheme(): void {
    this.themeService.nextTheme();
  }
}
