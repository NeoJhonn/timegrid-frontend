import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, CanActivateFn, UrlTree } from '@angular/router';
import { Subject } from 'rxjs';
import { WelcomePage } from '../app/features/welcome/welcome.page';
import { ShellLayout } from '../app/features/shell/shell.layout';
import { AuthService } from '../app/core/services/auth.service';
import { UserApiService } from '../app/core/services/user-api.service';
import { ThemeService } from '../app/core/services/theme.service';
import { UserResponse } from '../app/core/models/user.model';
import { JwtClaims } from '../app/core/models/auth.model';
import { authGuard } from '../app/core/guards/auth.guard';
import { guestGuard } from '../app/core/guards/guest.guard';
import { managerGuard } from '../app/core/guards/manager.guard';
import { claims, user } from './test-data';

for (const component of [WelcomePage, ShellLayout]) {
  describe(component.name + ' identity display', () => {
    let pending: Subject<UserResponse>;
    beforeEach(() => {
      pending = new Subject<UserResponse>();
      TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), provideRouter([]),
        { provide: AuthService, useValue: { currentUser: signal(claims), logout: () => {} } },
        { provide: UserApiService, useValue: { findById: () => pending } },
        { provide: ThemeService, useValue: { currentTheme: () => 'dark', nextTheme: () => {} } }] });
    });
    it('never renders email while waiting for the name, then displays first name only', () => {
      const fixture = TestBed.createComponent(component as typeof WelcomePage); fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).not.toContain(claims.sub);
      pending.next(user); fixture.detectChanges();
      expect(el.textContent).toContain('Ana'); expect(el.textContent).not.toContain('Ana Silva');
      expect(el.textContent).not.toContain(claims.sub); pending.complete();
    });
    it('does not fall back to email when profile loading fails', () => {
      const fixture = TestBed.createComponent(component as typeof WelcomePage); fixture.detectChanges();
      pending.error(new Error('network')); fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).textContent).not.toContain(claims.sub);
    });
  });
}

describe('Route permissions', () => {
  let authenticated: boolean;
  let identity: ReturnType<typeof signal<JwtClaims | null>>;
  const execute = (guard: CanActivateFn) => TestBed.runInInjectionContext(() => guard({} as never, {} as never));
  const destination = (guard: CanActivateFn) => TestBed.inject(Router).serializeUrl(execute(guard) as UrlTree);
  beforeEach(() => {
    authenticated = false; identity = signal<JwtClaims | null>(null);
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), provideRouter([]),
      { provide: AuthService, useValue: { currentUser: identity, isAuthenticated: () => authenticated } }] });
  });
  it('redirects unauthenticated visitors to login', () => expect(destination(authGuard)).toBe('/login'));
  it('lets an authenticated session enter protected routes', () => {
    authenticated = true; expect(execute(authGuard)).toBeTrue();
  });
  it('redirects authenticated visitors away from login', () => {
    authenticated = true; expect(destination(guestGuard)).toBe('/app/welcome');
  });
  it('lets visitors use login', () => expect(execute(guestGuard)).toBeTrue());
  it('restricts user management to manager', () => {
    identity.set({ ...claims, role: 'ADMIN' }); expect(destination(managerGuard)).toBe('/app/access-denied');
    identity.set(claims); expect(execute(managerGuard)).toBeTrue();
  });
});
