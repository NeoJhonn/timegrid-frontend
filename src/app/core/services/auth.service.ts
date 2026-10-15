import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, defer, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);
  private refreshInFlight?: Observable<LoginResponse>;

  readonly currentUser = computed(() => this.tokenStorage.claims());
  // Time passes without a signal update: do not cache expiration in a computed.
  readonly isAuthenticated = () => this.tokenStorage.isAuthenticated();

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, request).pipe(
      tap((tokens) => this.tokenStorage.saveTokens(tokens)),
    );
  }

  refresh(): Observable<LoginResponse> {
    if (this.refreshInFlight) return this.refreshInFlight;
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!this.tokenStorage.isRefreshTokenValid()) {
      this.logout();
      return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Sessão expirada' }));
    }

    this.refreshInFlight = this.http
      .post<LoginResponse>(`${API_BASE_URL}/auth/refresh`, { refreshToken })
      .pipe(
        map((tokens) => {
          // Never restore credentials if logout or a new login occurred meanwhile.
          if (this.tokenStorage.getRefreshToken() !== refreshToken) {
            throw new HttpErrorResponse({ status: 401, statusText: 'Sessão encerrada' });
          }
          this.tokenStorage.saveTokens(tokens);
          return tokens;
        }),
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && [400, 401, 403].includes(error.status) &&
              this.tokenStorage.getRefreshToken() === refreshToken) this.logout();
          return throwError(() => error);
        }),
        finalize(() => { this.refreshInFlight = undefined; }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    return this.refreshInFlight;
  }

  ensureAccessToken(): Observable<string> {
    return defer(() => {
      if (this.tokenStorage.isAccessTokenValid()) return of(this.getAccessToken()!);
      return this.refresh().pipe(map((tokens) => tokens.accessToken));
    });
  }

  logout(): void {
    this.tokenStorage.clear();
    void this.router.navigateByUrl('/login');
  }

  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }
}
