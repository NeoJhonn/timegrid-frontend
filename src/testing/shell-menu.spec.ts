import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ShellLayout } from '../app/features/shell/shell.layout';
import { AuthService } from '../app/core/services/auth.service';
import { ThemeService } from '../app/core/services/theme.service';
import { UserApiService } from '../app/core/services/user-api.service';
import { claims, user } from './test-data';

describe('Light theme hamburger menu', () => {
  let previousTheme: string | null;
  let previousStored: string | null;
  let previousScheme: string;

  beforeEach(() => {
    previousTheme = document.documentElement.getAttribute('data-theme');
    previousStored = localStorage.getItem('timegrid-theme');
    previousScheme = document.documentElement.style.getPropertyValue('color-scheme');
    TestBed.configureTestingModule({
      imports: [ShellLayout],
      providers: [
        provideZonelessChangeDetection(), provideRouter([]),
        { provide: AuthService, useValue: { currentUser: () => claims, logout: () => {} } },
        { provide: UserApiService, useValue: { findById: () => of(user) } },
      ],
    });
    TestBed.inject(ThemeService).setTheme('light');
  });

  afterEach(() => {
    if (previousTheme === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', previousTheme);
    if (previousStored === null) localStorage.removeItem('timegrid-theme');
    else localStorage.setItem('timegrid-theme', previousStored);
    document.documentElement.style.setProperty('color-scheme', previousScheme);
  });

  it('renders three dark bars on a light button using the actual header and global CSS', () => {
    const fixture = TestBed.createComponent(ShellLayout);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[aria-label="Abrir menu"]')!;
    const bars = button.querySelectorAll('span > span');
    expect(bars.length).toBe(3);
    expect(getComputedStyle(button).color).toBe('rgb(51, 65, 85)');
    for (const bar of bars) {
      expect(getComputedStyle(bar).backgroundColor).toBe('rgb(51, 65, 85)');
      expect(getComputedStyle(bar).backgroundColor).not.toBe(getComputedStyle(button).backgroundColor);
    }
    button.click(); fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('aside')).not.toBeNull();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[aria-label="Fechar menu"]')!.click();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('aside')).toBeNull();
  });
});
