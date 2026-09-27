import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { JwtClaims, LoginResponse } from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'timegrid.accessToken';
const REFRESH_TOKEN_KEY = 'timegrid.refreshToken';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly isBrowser: boolean;
  readonly claims = signal<JwtClaims | null>(null);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.claims.set(this.decodeAccessToken());
  }

  saveTokens(tokens: LoginResponse): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    this.claims.set(this.decodeAccessToken());
  }

  clear(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.claims.set(null);
  }

  getAccessToken(): string | null {
    return this.isBrowser ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  }

  getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  }

  isAuthenticated(): boolean {
    const claims = this.claims();

    if (!claims) {
      return false;
    }

    return claims.exp * 1000 > Date.now();
  }

  private decodeAccessToken(): JwtClaims | null {
    const token = this.getAccessToken();

    if (!token || !this.isBrowser) {
      return null;
    }

    try {
      const [, payload] = token.split('.');
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json) as JwtClaims;
    } catch {
      return null;
    }
  }
}

