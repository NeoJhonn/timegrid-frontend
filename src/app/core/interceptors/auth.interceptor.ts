import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, map, of, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const path = request.url.split('?')[0];
  const isApiRequest = path === API_BASE_URL || path.startsWith(`${API_BASE_URL}/`);
  const isAuthRequest = path === `${API_BASE_URL}/auth/login` || path === `${API_BASE_URL}/auth/refresh`;

  // Public auth endpoints must not receive an expired access token or trigger recursion.
  if (!isApiRequest || isAuthRequest) return next(request);

  const send = (token: string) => next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));

  return authService.ensureAccessToken().pipe(
    switchMap((token) => send(token).pipe(
      catchError((error: unknown) => {
        if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
          return throwError(() => error);
        }
        // Another request may have already renewed the token that was rejected.
        const currentToken = authService.getAccessToken();
        const replacement = currentToken && currentToken !== token
          ? of(currentToken)
          : authService.refresh().pipe(map((tokens) => tokens.accessToken));
        return replacement.pipe(switchMap((newToken) => send(newToken).pipe(
          catchError((retryError: unknown) => {
            if (retryError instanceof HttpErrorResponse && retryError.status === 401) {
              authService.logout();
            }
            return throwError(() => retryError);
          }),
        )));
      }),
    )),
  );
};
