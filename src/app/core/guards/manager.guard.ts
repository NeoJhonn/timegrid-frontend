import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const managerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()?.role === 'MANAGER') {
    return true;
  }

  return router.parseUrl('/app/access-denied');
};
