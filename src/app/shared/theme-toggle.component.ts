import { Component, computed, inject } from '@angular/core';
import { AppTheme, THEME_OPTIONS, ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <div
      class="theme-toggle inline-flex shrink-0 rounded-lg border border-white/10 bg-white/[0.06] p-1"
      aria-label="Selecionar tema"
    >
      @for (theme of themes; track theme.value) {
        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-md text-base font-black text-slate-300 transition hover:bg-white/10 hover:text-white"
          [class.theme-toggle-active]="currentTheme() === theme.value"
          [attr.aria-label]="theme.label"
          [attr.aria-pressed]="currentTheme() === theme.value"
          [title]="theme.label"
          (click)="setTheme(theme.value)"
        >
          {{ theme.icon }}
        </button>
      }
    </div>
  `,
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  protected readonly themes = THEME_OPTIONS;
  protected readonly currentTheme = computed(() => this.themeService.currentTheme());

  protected setTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
  }
}
