import { PLATFORM_ID, provideZonelessChangeDetection } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ThemeService } from '../app/core/services/theme.service';
import { apiErrorMessage } from '../app/shared/api-error-message';
import { firstNameFrom } from '../app/shared/user-display-name';

describe('Theme persistence', () => {
  let oldValue: string | null;
  let oldTheme: string | null;
  let oldScheme: string;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    oldValue = localStorage.getItem('timegrid-theme'); oldTheme = document.documentElement.getAttribute('data-theme');
    oldScheme = document.documentElement.style.getPropertyValue('color-scheme'); localStorage.removeItem('timegrid-theme');
  });
  afterEach(() => {
    if (oldValue === null) localStorage.removeItem('timegrid-theme'); else localStorage.setItem('timegrid-theme', oldValue);
    if (oldTheme === null) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', oldTheme);
    document.documentElement.style.setProperty('color-scheme', oldScheme);
  });
  it('cycles dark, light, violet and persists the selected theme', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.currentTheme()).toBe('dark'); service.nextTheme();
    expect(service.currentTheme()).toBe('light'); expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('timegrid-theme')).toBe('light'); service.nextTheme();
    expect(service.currentTheme()).toBe('violet'); service.nextTheme(); expect(service.currentTheme()).toBe('dark');
  });
  it('restores the stored theme on initialization', () => {
    localStorage.setItem('timegrid-theme', 'violet'); expect(TestBed.inject(ThemeService).currentTheme()).toBe('violet');
  });
  it('ignores invalid stored themes', () => {
    localStorage.setItem('timegrid-theme', 'unknown'); expect(TestBed.inject(ThemeService).currentTheme()).toBe('dark');
  });
  it('does not access localStorage during server rendering', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }, { provide: DOCUMENT, useValue: document }] });
    const read = spyOn(Storage.prototype, 'getItem').and.callThrough();
    const store = spyOn(Storage.prototype, 'setItem').and.callThrough();
    const service = TestBed.inject(ThemeService); service.nextTheme();
    expect(read).not.toHaveBeenCalled(); expect(store).not.toHaveBeenCalled();
  });
});

describe('User-facing errors', () => {
  it('translates network failures without leaking browser messages', () => {
    for (const status of [0, 500]) {
      expect(apiErrorMessage(new HttpErrorResponse({ status, error: 'Failed to fetch' }), 'fallback'))
        .toBe('Não foi possível conectar ao backend. Verifique sua conexão e tente novamente.');
    }
  });
  it('prioritizes field validation messages', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 400, error: { message: 'Invalid', fields: { name: 'Nome obrigatório.' } } }), 'fallback')).toBe('Nome obrigatório.');
  });
  it('preserves business errors and handles unknown failures', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 400, error: { message: 'Horário ocupado.' } }), 'fallback')).toBe('Horário ocupado.');
    expect(apiErrorMessage(new Error('unknown'), 'Mensagem segura.')).toBe('Mensagem segura.');
  });
  it('extracts first names with whitespace and safely handles missing names', () => {
    expect(firstNameFrom('  Ana   Silva ', '')).toBe('Ana');
    expect(firstNameFrom(null, 'fallback')).toBe('fallback'); expect(firstNameFrom(' ', '')).toBe('');
  });
});
