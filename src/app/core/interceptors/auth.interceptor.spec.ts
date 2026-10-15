import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { API_BASE_URL } from '../config/api.config';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { authGuard } from '../guards/auth.guard';
import { authInterceptor } from './auth.interceptor';

function jwt(type: 'access' | 'refresh', seconds: number): string {
  return `header.${btoa(JSON.stringify({ sub: 'test@example.test', userId: 'test', role: 'ADMIN',
    type, exp: Math.floor(Date.now() / 1000) + seconds })).replace(/=/g, '')}.signature`;
}

describe('Session renewal', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let storage: TokenStorageService;
  let auth: AuthService;
  let navigate: jasmine.Spy;
  const resource = `${API_BASE_URL}/users/test/appointments`;
  const refreshUrl = `${API_BASE_URL}/auth/refresh`;
  const ignoreError = { error: () => {} };
  const seed = (accessSeconds = -10, refreshSeconds = 86400) => {
    storage.saveTokens({ accessToken: jwt('access', accessSeconds), refreshToken: jwt('refresh', refreshSeconds) });
  };

  beforeEach(() => {
    localStorage.removeItem('timegrid.accessToken');
    localStorage.removeItem('timegrid.refreshToken');
    TestBed.configureTestingModule({ providers: [
      provideZonelessChangeDetection(), provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(),
    ] });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(TokenStorageService);
    auth = TestBed.inject(AuthService);
    navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
  });
  afterEach(() => {
    controller.verify();
    storage.clear();
  });

  it('renews expired access before sending the request and preserves the refresh deadline', () => {
    seed();
    const refreshToken = storage.getRefreshToken()!;
    http.get(resource).subscribe();
    controller.expectNone(resource);
    const renewal = controller.expectOne(refreshUrl);
    expect(renewal.request.headers.has('Authorization')).toBeFalse();
    expect(renewal.request.body).toEqual({ refreshToken });
    const accessToken = jwt('access', 3600);
    renewal.flush({ accessToken, refreshToken });
    const request = controller.expectOne(resource);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${accessToken}`);
    request.flush([]);
    expect(storage.getRefreshToken()).toBe(refreshToken);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('shares one refresh across concurrent API calls', () => {
    seed();
    expect(storage.isRefreshTokenValid()).toBeTrue();
    http.get(resource).subscribe();
    http.get(`${API_BASE_URL}/users/test/clients`).subscribe();
    controller.expectOne(refreshUrl).flush({ accessToken: jwt('access', 3600), refreshToken: storage.getRefreshToken() });
    controller.expectOne(resource).flush([]);
    controller.expectOne(`${API_BASE_URL}/users/test/clients`).flush([]);
  });

  it('allows the guard to restore a session using a valid refresh token', () => {
    seed();
    expect(TestBed.runInInjectionContext(() => authGuard({} as never, {} as never))).toBeTrue();
  });

  it('re-evaluates expiration as time passes without requiring a signal change', () => {
    jasmine.clock().install();
    try {
      jasmine.clock().mockDate(new Date('2026-10-15T12:00:00Z'));
      seed(3600, 86400);
      expect(auth.isAuthenticated()).toBeTrue();
      jasmine.clock().mockDate(new Date('2026-10-16T12:00:01Z'));
      expect(auth.isAuthenticated()).toBeFalse();
    } finally { jasmine.clock().uninstall(); }
  });

  it('returns to login when both tokens have expired without calling the API', () => {
    seed(-10, -10);
    http.get(resource).subscribe(ignoreError);
    controller.expectNone(refreshUrl);
    controller.expectNone(resource);
    expect(navigate).toHaveBeenCalledWith('/login');
    expect(storage.getRefreshToken()).toBeNull();
  });

  it('returns to login when the backend rejects refresh with its documented 400 response', () => {
    seed();
    http.get(resource).subscribe(ignoreError);
    controller.expectOne(refreshUrl).flush({ message: 'Refresh token invalido ou expirado.' }, { status: 400, statusText: 'Bad Request' });
    expect(navigate).toHaveBeenCalledWith('/login');
    expect(storage.getRefreshToken()).toBeNull();
  });

  it('preserves the session after a refresh network failure and can try again', () => {
    seed();
    const refreshToken = storage.getRefreshToken();
    http.get(resource).subscribe(ignoreError);
    controller.expectOne(refreshUrl).error(new ProgressEvent('error'));
    expect(navigate).not.toHaveBeenCalled();
    expect(storage.getRefreshToken()).toBe(refreshToken);
    http.get(resource).subscribe();
    controller.expectOne(refreshUrl).flush({ accessToken: jwt('access', 3600), refreshToken });
    controller.expectOne(resource).flush([]);
  });

  it('does not send a bearer token to login or refresh external URLs', () => {
    seed(3600);
    http.post(`${API_BASE_URL}/auth/login`, {}).subscribe();
    const login = controller.expectOne(`${API_BASE_URL}/auth/login`);
    expect(login.request.headers.has('Authorization')).toBeFalse();
    login.flush({});
    http.get(`${API_BASE_URL}.example.test/data`).subscribe();
    const external = controller.expectOne(`${API_BASE_URL}.example.test/data`);
    expect(external.request.headers.has('Authorization')).toBeFalse();
    external.flush({});
  });

  it('retries once after 401, without logging out for a subsequent permission error', () => {
    seed(3600);
    http.get(resource).subscribe(ignoreError);
    controller.expectOne(resource).flush({}, { status: 401, statusText: 'Unauthorized' });
    controller.expectOne(refreshUrl).flush({ accessToken: jwt('access', 7200), refreshToken: storage.getRefreshToken() });
    controller.expectOne(resource).flush({}, { status: 403, statusText: 'Forbidden' });
    expect(navigate).not.toHaveBeenCalled();
    expect(storage.getRefreshToken()).not.toBeNull();
  });

  it('logs out if a renewed access token is still rejected with 401', () => {
    seed(3600);
    http.get(resource).subscribe(ignoreError);
    controller.expectOne(resource).flush({}, { status: 401, statusText: 'Unauthorized' });
    controller.expectOne(refreshUrl).flush({ accessToken: jwt('access', 7200), refreshToken: storage.getRefreshToken() });
    controller.expectOne(resource).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('does not restore or use an old refresh response after logout', () => {
    seed();
    http.get(resource).subscribe(ignoreError);
    const renewal = controller.expectOne(refreshUrl);
    const refreshToken = storage.getRefreshToken();
    auth.logout();
    renewal.flush({ accessToken: jwt('access', 3600), refreshToken });
    controller.expectNone(resource);
    expect(storage.getAccessToken()).toBeNull();
  });
});



