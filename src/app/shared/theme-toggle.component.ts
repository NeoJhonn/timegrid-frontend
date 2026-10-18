import { Component, computed, inject } from '@angular/core';
import { THEME_OPTIONS, ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button type="button" class="theme-toggle"
      [attr.aria-label]="activeTheme().label + '. Clique para alternar tema.'"
      [title]="activeTheme().label" (click)="nextTheme()">
      <svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true" focusable="false" [attr.data-theme-icon]="activeTheme().value">
        @switch (activeTheme().value) {
          @case ('light') {
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          }
          @case ('violet') {
            <circle cx="12" cy="8" r="5" />
            <path d="M12 13v9m-4-4h8" />
          }
          @default {
            <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
          }
        }
      </svg>
    </button>
  `,
  styles: `
    :host { display: block; flex-shrink: 0; }
    .theme-toggle {
      display: grid; place-items: center; width: 44px; height: 44px; padding: 4px;
      border: 1px solid var(--tg-border); border-radius: .5rem;
      background-color: var(--tg-panel-strong); color: var(--tg-text-strong);
      box-shadow: 0 4px 12px rgba(15, 23, 42, .12);
      transition: border-color 150ms, transform 150ms;
    }
    .theme-toggle:hover { border-color: var(--tg-primary-strong); }
    .theme-toggle:active { transform: scale(.98); }
    .theme-toggle:focus-visible { outline: 3px solid var(--tg-primary-strong); outline-offset: 3px; }
    .theme-icon { display: block; width: 34px; height: 34px; flex-shrink: 0; }
  `,
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);
  protected readonly activeTheme = computed(() =>
    THEME_OPTIONS.find((theme) => theme.value === this.themeService.currentTheme()) ?? THEME_OPTIONS[0],
  );
  protected nextTheme(): void { this.themeService.nextTheme(); }
}
