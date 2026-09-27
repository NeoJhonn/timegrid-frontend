import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly currentUser = computed(() => this.tokenStorage.claims());
  readonly isAuthenticated = computed(() => this.tokenStorage.isAuthenticated());

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, request).pipe(
      tap((tokens) => {
        this.tokenStorage.saveTokens(tokens);
      }),
    );
  }

  refresh(): Observable<LoginResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();

    return this.http
      .post<LoginResponse>(`${API_BASE_URL}/auth/refresh`, { refreshToken })
      .pipe(tap((tokens) => this.tokenStorage.saveTokens(tokens)));
  }

  logout(): void {
    this.tokenStorage.clear();
    void this.router.navigateByUrl('/login');
  }

  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }
}

