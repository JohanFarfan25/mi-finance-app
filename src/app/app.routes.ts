import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'splash',
        loadComponent: () =>
          import('./features/auth/pages/splash/splash.page').then(
            (m) => m.SplashPage,
          ),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login.page').then(
            (m) => m.LoginPage,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register/register.page').then(
            (m) => m.RegisterPage,
          ),
      },
      { path: '', redirectTo: 'splash', pathMatch: 'full' },
    ],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (m) => m.DASHBOARD_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: '/auth/splash', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/splash' },
];
