import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../state/session.store';

export const authGuard: CanActivateFn = () => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);

  if (sessionStore.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const noAuthGuard: CanActivateFn = () => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);

  if (!sessionStore.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/tabs/today']);
};

export const profileGuard: CanActivateFn = () => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);

  if (!sessionStore.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (sessionStore.hasProfile()) {
    return true;
  }

  return router.createUrlTree(['/setup']);
};
