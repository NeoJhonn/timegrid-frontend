import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { UserCreatePage } from '../app/features/users/user-create.page';
import { HistoryPage } from '../app/features/history/history.page';
import { AuthService } from '../app/core/services/auth.service';
import { UserApiService } from '../app/core/services/user-api.service';
import { ClientApiService } from '../app/core/services/client-api.service';
import { AppointmentApiService } from '../app/core/services/appointment-api.service';
import { UserResponse } from '../app/core/models/user.model';
import { claims, user, client, appointment } from './test-data';

describe('User management regressions', () => {
  let page: UserCreatePage;
  let api: jasmine.SpyObj<UserApiService>;
  beforeEach(() => {
    api = jasmine.createSpyObj('users', ['list', 'create', 'update', 'resetPassword', 'delete']);
    api.list.and.returnValue(of([user])); api.create.and.returnValue(of(user)); api.update.and.returnValue(of(user));
    api.resetPassword.and.returnValue(of(void 0)); api.delete.and.returnValue(of(void 0));
    TestBed.configureTestingModule({ imports: [UserCreatePage], providers: [provideZonelessChangeDetection(),
      { provide: AuthService, useValue: { currentUser: () => claims } }, { provide: UserApiService, useValue: api }] });
    const fixture = TestBed.createComponent(UserCreatePage); page = fixture.componentInstance; fixture.detectChanges();
  });
  for (const password of ['short', 'lowercase1', 'UPPERCASE1']) {
    it('rejects weak creation password: ' + password, () => {
      page['createForm'].setValue({ username: 'Ana', email: 'ana@example.test', password, role: 'ADMIN' });
      page['createUser'](); expect(api.create).not.toHaveBeenCalled();
      expect(page['createForm'].controls.password.hasError('passwordStrength')).toBeTrue();
    });
  }
  it('creates with trimmed fields and the selected profile', () => {
    page['openCreate'](); page['createForm'].setValue({ username: ' Ana ', email: ' ana@example.test ', password: 'Password1', role: 'ADMIN' });
    page['createUser']();
    expect(api.create).toHaveBeenCalledOnceWith({ username: 'Ana', email: 'ana@example.test', password: 'Password1', role: 'ADMIN' });
    expect(page['createModalOpen']()).toBeFalse();
  });
  it('keeps general updates separate from the password reset endpoint', () => {
    page['openEdit'](user); page['editForm'].patchValue({ username: 'Novo nome', newPassword: 'Password2' }); page['saveEdit']();
    expect(api.update).toHaveBeenCalledOnceWith(user.id, { username: 'Novo nome', email: user.email, role: user.role });
    expect(api.resetPassword).toHaveBeenCalledOnceWith(user.id, { newPassword: 'Password2' });
    expect(page['editingUser']()).toBeNull();
  });
  it('waits for successful general update before resetting password', () => {
    const pending = new Subject<UserResponse>(); api.update.and.returnValue(pending);
    page['openEdit'](user); page['editForm'].controls.newPassword.setValue('Password2'); page['saveEdit']();
    expect(api.resetPassword).not.toHaveBeenCalled();
    pending.error(new HttpErrorResponse({ status: 400, error: { message: 'E-mail duplicado.' } }));
    expect(api.resetPassword).not.toHaveBeenCalled(); expect(page['editingUser']()).toEqual(user);
    expect(page['saving']()).toBeFalse(); expect(page['errorMessage']()).toBe('E-mail duplicado.');
  });
  it('does not delete a user when the confirmation is cancelled', () => {
    page['openDelete'](user); page['closeDelete'](); page['confirmDelete'](); expect(api.delete).not.toHaveBeenCalled();
    page['openDelete'](user); page['confirmDelete'](); expect(api.delete).toHaveBeenCalledOnceWith(user.id);
  });
});

describe('History regressions', () => {
  let page: HistoryPage;
  let api: jasmine.SpyObj<AppointmentApiService>;
  beforeEach(() => {
    api = jasmine.createSpyObj('appointments', ['listByDate']); api.listByDate.and.returnValue(of([]));
    TestBed.configureTestingModule({ imports: [HistoryPage], providers: [provideZonelessChangeDetection(),
      { provide: AuthService, useValue: { currentUser: () => claims } },
      { provide: ClientApiService, useValue: { list: () => of([client]) } },
      { provide: AppointmentApiService, useValue: api }] });
    const fixture = TestBed.createComponent(HistoryPage); page = fixture.componentInstance; fixture.detectChanges();
  });
  it('does not fetch history until a client is selected', () => {
    page['loadHistory'](); page['setWindow'](7, 0);
    expect(api.listByDate).not.toHaveBeenCalled();
  });
  it('opens suggestions only after typing and clears previous selection', () => {
    page['openClientSuggestions'](); expect(page['clientSuggestionsOpen']()).toBeFalse();
    page['selectClient'](client); page['appointments'].set([appointment]); page['updateClientQuery']('maria');
    expect(page['filteredClients']()).toEqual([client]); expect(page['selectedClientId']()).toBe('');
    expect(page['appointments']()).toEqual([]); expect(page['clientSuggestionsOpen']()).toBeTrue();
  });
  it('filters other clients and sorts selected client appointments newest first', () => {
    const older = { ...appointment, id: 'older', appointmentDate: '2026-10-17' };
    api.listByDate.and.returnValue(of([older, { ...appointment, clientId: 'another' }, appointment]));
    page['setWindow'](0, 0); page['selectClientAndLoad'](client);
    expect(api.listByDate).toHaveBeenCalledTimes(1);
    expect(page['appointments']().map(a => a.id)).toEqual([appointment.id, 'older']);
  });
  it('queries every date in the selected window for the logged-in user', () => {
    page['setWindow'](2, 1); page['selectClientAndLoad'](client);
    expect(api.listByDate).toHaveBeenCalledTimes(4);
    expect(api.listByDate.calls.allArgs().every(args => args[0] === claims.userId)).toBeTrue();
    expect(new Set(api.listByDate.calls.allArgs().map(args => args[1])).size).toBe(4);
    expect(page['loading']()).toBeFalse();
  });
});
