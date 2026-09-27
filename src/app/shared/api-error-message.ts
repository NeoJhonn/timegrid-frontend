import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../core/models/api-error.model';

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const response = error.error as ApiErrorResponse | string | null;

    if (typeof response === 'string' && response.trim()) {
      return response;
    }

    if (response && typeof response === 'object') {
      if (response.fields && Object.keys(response.fields).length > 0) {
        return Object.values(response.fields)[0] ?? fallback;
      }

      if (response.message) {
        return response.message;
      }
    }

    if (error.status === 0) {
      return 'Nao foi possivel conectar ao backend. Confirme se ele esta rodando.';
    }
  }

  return fallback;
}

