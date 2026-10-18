import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { authGuard } from '../app/core/guards/auth.guard';
import { guestGuard } from '../app/core/guards/guest.guard';

@Component({ template: 'Agenda' })
class AgendaStub {}
@Component({ template: 'Login' })
class LoginStub { constructor() { loginRenders++; } }
let loginRenders = 0;

describe('Initial browser session navigation', () => {
  let saved: (string | null)[];
  const keys = ['timegrid.accessToken', 'timegrid.refreshToken'];
  const token = (type: string, seconds: number) => 'header.' + btoa(JSON.stringify({
    sub: 'ana@example.test', userId: 'user-1', role: 'MANAGER', type,
    exp: Math.floor(Date.now() / 1000) + seconds,
  })) + '.signature';
  beforeEach(() => {
    saved = keys.map(key => localStorage.getItem(key));
    keys.forEach(key => localStorage.removeItem(key));
    loginRenders = 0;
    TestBed.configureTestingModule({ providers: [
      provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(),
      provideRouter([
        { path: 'app/agenda', component: AgendaStub, canActivate: [authGuard] },
        { path: 'app/welcome', component: AgendaStub, canActivate: [authGuard] },
        { path: 'login', component: LoginStub, canActivate: [guestGuard] },
      ]),
    ] });
  });
  afterEach(() => keys.forEach((key, i) => saved[i] === null
    ? localStorage.removeItem(key) : localStorage.setItem(key, saved[i]!)));

  for (const accessLifetime of [3600, -60]) {
    it(`restores a protected URL without constructing login (access lifetime ${accessLifetime})`, async () => {
      localStorage.setItem(keys[0], token('access', accessLifetime));
      localStorage.setItem(keys[1], token('refresh', 86400));
      const harness = await RouterTestingHarness.create('/app/agenda');
      expect(TestBed.inject(Router).url).toBe('/app/agenda');
      expect(harness.routeNativeElement?.textContent).toBe('Agenda');
      expect(loginRenders).toBe(0);
    });
  }
  it('shows login when both credentials expired', async () => {
    localStorage.setItem(keys[0], token('access', -60));
    localStorage.setItem(keys[1], token('refresh', -60));
    await RouterTestingHarness.create('/app/agenda');
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(loginRenders).toBe(1);
  });
  it('redirects an authenticated login URL without rendering the login form', async () => {
    localStorage.setItem(keys[0], token('access', 3600));
    await RouterTestingHarness.create('/login');
    expect(TestBed.inject(Router).url).toBe('/app/welcome');
    expect(loginRenders).toBe(0);
  });
});

describe('Theme before Angular bootstrap', () => {
  let source: string;
  beforeAll(async () => {
    const response = await fetch('/theme-init.js');
    expect(response.ok).toBeTrue();
    source = await response.text();
  });
  for (const theme of ['dark', 'light', 'violet', 'invalid', null]) {
    it(`applies stored theme ${theme} before any application markup exists`, () => {
      const doc = document.implementation.createHTMLDocument();
      const storage = { getItem: () => theme };
      new Function('document', 'localStorage', source)(doc, storage);
      expect(doc.documentElement.getAttribute('data-theme')).toBe(theme === 'light' || theme === 'violet' ? theme : 'dark');
      expect(doc.documentElement.style.colorScheme).toBe(theme === 'light' ? 'light' : 'dark');
      expect(doc.querySelector('app-root')).toBeNull();
    });
  }
  it('falls back safely when browser storage is blocked', () => {
    const doc = document.implementation.createHTMLDocument();
    new Function('document', 'localStorage', source)(doc, { getItem() { throw new Error('Denied'); } });
    expect(doc.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
