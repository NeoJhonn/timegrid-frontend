import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { LoginPage } from '../app/features/login/login.page';
import { AccountPage } from '../app/features/account/account.page';
import { AuthService } from '../app/core/services/auth.service';
import { UserApiService } from '../app/core/services/user-api.service';
import { ThemeService } from '../app/core/services/theme.service';
import { claims, user } from './test-data';

describe('Login interactions', () => {
  let login: jasmine.Spy;
  let page: LoginPage;
  let navigate: jasmine.Spy;
  beforeEach(() => {
    login = jasmine.createSpy('login').and.returnValue(of({ accessToken: 'access', refreshToken: 'refresh' }));
    TestBed.configureTestingModule({ imports: [LoginPage], providers: [provideZonelessChangeDetection(), provideRouter([]),
      { provide: AuthService, useValue: { login } },
      { provide: ThemeService, useValue: { currentTheme: () => 'dark', nextTheme: () => {} } }] });
    page = TestBed.createComponent(LoginPage).componentInstance;
    navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
  });
  it('starts empty and blocks invalid email', () => {
    expect(page['form'].getRawValue()).toEqual({ email: '', password: '' });
    page['form'].setValue({ email: 'invalid', password: 'secret' }); page['submit']();
    expect(login).not.toHaveBeenCalled(); expect(page['form'].controls.email.touched).toBeTrue();
  });
  it('submits credentials and navigates only after successful login', () => {
    page['form'].setValue({ email: ' ana@example.test ', password: ' Password1 ' }); page['submit']();
    expect(login).toHaveBeenCalledOnceWith({ email: 'ana@example.test', password: 'Password1' });
    expect(navigate).toHaveBeenCalledWith('/app/welcome'); expect(page['loading']()).toBeFalse();
  });
  it('keeps login visible after rejected credentials', () => {
    login.and.returnValue(throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Credenciais inválidas.' } })));
    page['form'].setValue({ email: 'ana@example.test', password: 'wrong' }); page['submit']();
    expect(navigate).not.toHaveBeenCalled(); expect(page['errorMessage']()).toBe('Credenciais inválidas.');
    expect(page['loading']()).toBeFalse();
  });
  it('does not send a second login while the first is pending', () => {
    const pending = new Subject(); login.and.returnValue(pending);
    page['form'].setValue({ email: 'ana@example.test', password: 'secret' }); page['submit'](); page['submit']();
    expect(login).toHaveBeenCalledTimes(1); pending.complete();
  });
});

describe('Account password regressions', () => {
  let page: AccountPage;
  let api: jasmine.SpyObj<UserApiService>;
  beforeEach(() => {
    api = jasmine.createSpyObj('users', ['findById', 'changeOwnPassword']);
    api.findById.and.returnValue(of(user)); api.changeOwnPassword.and.returnValue(of(void 0));
    TestBed.configureTestingModule({ imports: [AccountPage], providers: [provideZonelessChangeDetection(),
      { provide: AuthService, useValue: { currentUser: () => claims } }, { provide: UserApiService, useValue: api }] });
    const fixture = TestBed.createComponent(AccountPage); page = fixture.componentInstance; fixture.detectChanges();
  });
  it('does not submit empty passwords', () => {
    page['openPasswordModal'](); page['updatePassword']();
    expect(api.changeOwnPassword).not.toHaveBeenCalled(); expect(page['passwordForm'].touched).toBeTrue();
  });
  it('sends current and new password then clears and closes on success', () => {
    page['openPasswordModal'](); page['passwordForm'].setValue({ currentPassword: 'OldPass1', newPassword: 'NewPass2' });
    page['updatePassword']();
    expect(api.changeOwnPassword).toHaveBeenCalledOnceWith({ currentPassword: 'OldPass1', newPassword: 'NewPass2' });
    expect(page['passwordModalOpen']()).toBeFalse(); expect(page['passwordForm'].controls.newPassword.value).toBe('');
  });
  it('shows password errors inside the modal and preserves the form', () => {
    api.changeOwnPassword.and.returnValue(throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Senha atual incorreta.' } })));
    page['openPasswordModal'](); page['passwordForm'].setValue({ currentPassword: 'WrongPass1', newPassword: 'NewPass2' }); page['updatePassword']();
    expect(page['passwordModalOpen']()).toBeTrue(); expect(page['passwordErrorMessage']()).toBe('Senha atual incorreta.');
    expect(page['errorMessage']()).toBe(''); expect(page['saving']()).toBeFalse();
  });
  it('resets password visibility and sensitive input when reopening', () => {
    page['openPasswordModal'](); page['toggleNewPassword'](); page['toggleCurrentPassword']();
    page['passwordForm'].setValue({ currentPassword: 'secret', newPassword: 'secret2' });
    page['closePasswordModal'](); page['openPasswordModal']();
    expect(page['showNewPassword']()).toBeFalse(); expect(page['showCurrentPassword']()).toBeFalse();
    expect(page['passwordForm'].getRawValue()).toEqual({ currentPassword: '', newPassword: '' });
  });
});
