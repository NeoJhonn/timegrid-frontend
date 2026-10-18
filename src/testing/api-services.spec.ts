import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ClientApiService } from '../app/core/services/client-api.service';
import { UserApiService } from '../app/core/services/user-api.service';
import { AppointmentApiService } from '../app/core/services/appointment-api.service';
import { ClientResponse } from '../app/core/models/client.model';
import { API_BASE_URL } from '../app/core/config/api.config';
import { client, user, appointment } from './test-data';

describe('API contracts and client cache', () => {
  let http: HttpTestingController;
  let clients: ClientApiService;
  let users: UserApiService;
  let appointments: AppointmentApiService;
  const clientUrl = API_BASE_URL + '/users/' + user.id + '/clients';
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController); clients = TestBed.inject(ClientApiService);
    users = TestBed.inject(UserApiService); appointments = TestBed.inject(AppointmentApiService);
  });
  afterEach(() => http.verify());
  function cache() { clients.list(user.id).subscribe(); http.expectOne(clientUrl).flush([client]); }
  function cachedResult(expected: ClientResponse[]) {
    let result: ClientResponse[] | undefined;
    clients.list(user.id).subscribe(value => result = value); http.expectNone(clientUrl);
    expect(result).toEqual(expected);
  }
  it('reuses client lists but isolates cache by user', () => {
    cache(); cachedResult([client]);
    clients.list('other-user').subscribe(); const request = http.expectOne(API_BASE_URL + '/users/other-user/clients');
    expect(request.request.method).toBe('GET'); request.flush([]);
  });
  it('updates cached clients after creation', () => {
    cache(); const added = { ...client, id: 'new' };
    clients.create(user.id, { name: added.name, phone: added.phone }).subscribe();
    const request = http.expectOne(clientUrl); expect(request.request.method).toBe('POST'); request.flush(added);
    cachedResult([client, added]);
  });
  it('replaces an edited cached client rather than adding a duplicate', () => {
    cache(); const edited = { ...client, name: 'Updated' };
    clients.update(user.id, client.id, { name: edited.name, phone: edited.phone }).subscribe();
    const request = http.expectOne(clientUrl + '/' + client.id); expect(request.request.method).toBe('PUT'); request.flush(edited);
    cachedResult([edited]);
  });
  it('removes deleted clients from cache only after success', () => {
    cache(); clients.delete(user.id, client.id).subscribe();
    const request = http.expectOne(clientUrl + '/' + client.id); expect(request.request.method).toBe('DELETE'); request.flush(null);
    cachedResult([]);
  });
  it('does not corrupt cache after a failed update', () => {
    cache(); clients.update(user.id, client.id, { name: 'Changed', phone: client.phone }).subscribe({ error: () => {} });
    http.expectOne(clientUrl + '/' + client.id).flush({}, { status: 500, statusText: 'Server Error' });
    cachedResult([client]);
  });
  it('does not cache the agenda and includes the requested date', () => {
    const url = API_BASE_URL + '/users/' + user.id + '/appointments?date=2026-10-18';
    for (let i = 0; i < 2; i++) {
      appointments.listByDate(user.id, '2026-10-18').subscribe();
      const request = http.expectOne(url); expect(request.request.method).toBe('GET'); request.flush([]);
    }
  });
  it('uses the general user update contract without a password', () => {
    const body = { username: 'Ana', email: user.email, role: user.role };
    users.update(user.id, body).subscribe(); const request = http.expectOne(API_BASE_URL + '/users/' + user.id);
    expect(request.request.method).toBe('PUT'); expect(request.request.body).toEqual(body); request.flush(user);
  });
  it('uses separate PATCH endpoints for own password and administrative reset', () => {
    users.changeOwnPassword({ currentPassword: 'OldPass1', newPassword: 'NewPass2' }).subscribe();
    const own = http.expectOne(API_BASE_URL + '/users/me/password'); expect(own.request.method).toBe('PATCH');
    expect(own.request.body).toEqual({ currentPassword: 'OldPass1', newPassword: 'NewPass2' }); own.flush(null);
    users.resetPassword(user.id, { newPassword: 'ResetPass3' }).subscribe();
    const reset = http.expectOne(API_BASE_URL + '/users/' + user.id + '/password'); expect(reset.request.method).toBe('PATCH');
    expect(reset.request.body).toEqual({ newPassword: 'ResetPass3' }); reset.flush(null);
  });
  it('updates only editable appointment fields', () => {
    const body = { service: 'Review', endTime: 'T1030' as const };
    appointments.update(user.id, appointment.id, body).subscribe();
    const request = http.expectOne(API_BASE_URL + '/users/' + user.id + '/appointments/' + appointment.id);
    expect(request.request.method).toBe('PUT'); expect(request.request.body).toEqual(body); request.flush(appointment);
  });
});
