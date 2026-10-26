import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPage),
    canActivate: [noAuthGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.page').then((m) => m.RegisterPage),
    canActivate: [noAuthGuard],
  },
  {
    path: 'setup',
    loadComponent: () => import('./features/setup/setup.page').then((m) => m.SetupPage),
    canActivate: [authGuard],
  },
  {
    path: 'tabs',
    loadComponent: () => import('./features/tabs/tabs.page').then((m) => m.TabsPage),
    canActivate: [authGuard],
    children: [
      {
        path: 'today',
        loadComponent: () => import('./features/today/today.page').then((m) => m.TodayPage),
      },
      {
        path: 'today/:dayNo',
        loadComponent: () => import('./features/today/today.page').then((m) => m.TodayPage),
      },
      {
        path: 'plan',
        loadComponent: () => import('./features/plan/plan.page').then((m) => m.PlanPage),
      },
      {
        path: 'progress',
        loadComponent: () => import('./features/progress/progress.page').then((m) => m.ProgressPage),
      },
      {
        path: 'coach',
        loadComponent: () => import('./features/coach/coach.page').then((m) => m.CoachPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'today',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'tabs/today',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'tabs/today',
  },
];
