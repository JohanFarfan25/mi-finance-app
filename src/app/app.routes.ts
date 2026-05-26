import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'splash', loadComponent: () => import('./features/auth/pages/splash/splash.page').then(m => m.SplashPage)
      },
      {
        path: 'login', loadComponent: () => import('./features/auth/pages/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'register', loadComponent: () => import('./features/auth/pages/register/register.page').then(m => m.RegisterPage)
      },
      {
        path: '', redirectTo: 'splash', pathMatch: 'full'
      }
    ]
  },
  {
    path: 'dashboard', loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.page').then(m => m.DashboardPage), canActivate: [AuthGuard]
  },
  {
    path: 'income', loadComponent: () => import('./features/transactions/pages/income/income.page').then(m => m.IncomePage), canActivate: [AuthGuard]
  },
  {
    path: 'expense', loadComponent: () => import('./features/transactions/pages/expense/expense.page').then(m => m.ExpensePage), canActivate: [AuthGuard]
  },
  {
    path: 'categories', loadComponent: () => import('./features/categories/pages/categories/categories.page').then(m => m.CategoriesPage), canActivate: [AuthGuard]
  },
  {
    path: 'category-detail', loadComponent: () => import('./features/categories/pages/category-detail/category-detail.page').then(m => m.CategoryDetailPage), canActivate: [AuthGuard]
  },
  {
    path: 'budgets', loadComponent: () => import('./features/budgets/pages/budgets/budget.page').then(m => m.BudgetPage), canActivate: [AuthGuard]
  },
  {
    path: 'reports', loadComponent: () => import('./features/reports/pages/reports/reports.page').then(m => m.ReportsPage), canActivate: [AuthGuard]
  },
  {
    path: 'settings', loadComponent: () => import('./features/settings/pages/settings/settings.page').then(m => m.SettingsPage), canActivate: [AuthGuard]
  },
  {
    path: '', redirectTo: '/auth/splash', pathMatch: 'full'
  },
  {
    path: '**', redirectTo: '/auth/splash'
  }
];