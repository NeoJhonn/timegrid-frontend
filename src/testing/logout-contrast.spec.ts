import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ShellLayout } from '../app/features/shell/shell.layout';
import { AuthService } from '../app/core/services/auth.service';
import { ThemeService, AppTheme } from '../app/core/services/theme.service';
import { UserApiService } from '../app/core/services/user-api.service';
import { claims, user } from './test-data';

describe('Logout action contrast', () => {
  let previousTheme: string | null;
  let previousStored: string | null;
  let previousScheme: string;

  beforeEach(() => {
    previousTheme = document.documentElement.getAttribute('data-theme');
    previousStored = localStorage.getItem('timegrid-theme');
    previousScheme = document.documentElement.style.getPropertyValue('color-scheme');
  });
  afterEach(() => {
    if (previousTheme === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', previousTheme);
    if (previousStored === null) localStorage.removeItem('timegrid-theme');
    else localStorage.setItem('timegrid-theme', previousStored);
    document.documentElement.style.setProperty('color-scheme', previousScheme);
  });

  for (const theme of ['light', 'dark', 'violet'] as AppTheme[]) {
    it('keeps logout readable without a selected background and requires confirmation in ' + theme, () => {
      const logout = jasmine.createSpy('logout');
      TestBed.configureTestingModule({
        imports: [ShellLayout], providers: [provideZonelessChangeDetection(), provideRouter([]),
          { provide: AuthService, useValue: { currentUser: () => claims, logout } },
          { provide: UserApiService, useValue: { findById: () => of(user) } }],
      });
      TestBed.inject(ThemeService).setTheme(theme);
      const fixture = TestBed.createComponent(ShellLayout);
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      element.querySelector<HTMLButtonElement>('[aria-label="Abrir menu"]')!.click();
      fixture.detectChanges();
      const button = element.querySelector<HTMLButtonElement>('.mobile-menu-nav > button')!;
      expect(button.textContent).toContain('Sair da conta');
      expect(getComputedStyle(button).color).toBe(theme === 'light' ? 'rgb(185, 28, 28)' : 'rgb(252, 165, 165)');
      expect(getComputedStyle(button).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      const badge = button.querySelector('span')!;
      expect(getComputedStyle(badge).backgroundColor).toBe('rgb(220, 38, 38)');
      expect(getComputedStyle(badge).color).toBe('rgb(255, 255, 255)');
      button.click();
      fixture.detectChanges();
      const dialog = element.querySelector<HTMLDialogElement>('dialog')!;
      expect(dialog.open).toBeTrue();
      expect(dialog.getAttribute('aria-labelledby')).toBe('logout-title');
      expect(logout).not.toHaveBeenCalled();
      dialog.querySelector<HTMLButtonElement>('button')!.click();
      expect(dialog.open).toBeFalse();
      expect(logout).not.toHaveBeenCalled();
      button.click();
      dialog.querySelector<HTMLButtonElement>('.logout-confirm')!.click();
      fixture.detectChanges();
      expect(dialog.open).toBeFalse();
      expect(element.querySelector('.mobile-menu-nav')).toBeNull();
      expect(logout).toHaveBeenCalledOnceWith();
    });
  }
});
