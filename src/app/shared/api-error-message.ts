import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../core/models/api-error.model';

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const response = error.error as ApiErrorResponse | string | null;

    if (error.status === 0) {
      return 'Não foi possível conectar ao backend. Verifique sua conexão e tente novamente.';
    }

    if (typeof response === 'string' && response.trim()) {
      if (isNetworkErrorMessage(response)) {
        return 'Não foi possível conectar ao backend. Verifique sua conexão e tente novamente.';
      }

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

    if (isNetworkErrorMessage(error.message)) {
      return 'Não foi possível conectar ao backend. Verifique sua conexão e tente novamente.';
    }
  }

  return fallback;
}

function isNetworkErrorMessage(message: string): boolean {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('failure to fetch') ||
    normalizedMessage.includes('networkerror') ||
    normalizedMessage.includes('network error') ||
    normalizedMessage.includes('load failed')
  );
}
