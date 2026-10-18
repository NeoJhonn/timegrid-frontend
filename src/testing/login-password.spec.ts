import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginPage } from '../app/features/login/login.page';
import { AuthService } from '../app/core/services/auth.service';
import { ThemeService } from '../app/core/services/theme.service';

describe('Login password eye button', () => {
  it('toggles icons and visibility without clearing the password or submitting login', () => {
    const login = jasmine.createSpy('login');
    TestBed.configureTestingModule({
      imports: [LoginPage], providers: [provideZonelessChangeDetection(), provideRouter([]),
        { provide: AuthService, useValue: { login } },
        { provide: ThemeService, useValue: { currentTheme: signal('dark'), nextTheme: () => {} } }],
    });
    const fixture = TestBed.createComponent(LoginPage);
    fixture.componentInstance['form'].setValue({ email: 'test@example.test', password: 'Secret123' });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLInputElement>('#login-password')!;
    const button = element.querySelector<HTMLButtonElement>('[aria-controls="login-password"]')!;
    expect(input.type).toBe('password');
    expect(button.getAttribute('aria-label')).toBe('Mostrar senha');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.querySelector('circle')).toBeNull();
    expect(button.textContent?.trim()).toBe('');
    button.click(); fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(input.value).toBe('Secret123');
    expect(button.getAttribute('aria-label')).toBe('Ocultar senha');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.querySelector('circle')).not.toBeNull();
    button.click(); fixture.detectChanges();
    expect(input.type).toBe('password');
    expect(input.value).toBe('Secret123');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.querySelector('circle')).toBeNull();
    expect(button.type).toBe('button');
    expect(login).not.toHaveBeenCalled();
  });
});
