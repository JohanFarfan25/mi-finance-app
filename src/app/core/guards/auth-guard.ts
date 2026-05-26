import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

/**
 * Proteger rutas que requieren que el usuario esté autenticado.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async canActivate(): Promise<boolean> {
    const isAuth = await this.authService.isAuthenticated();
    if (isAuth) return true;
    this.router.navigate(['/auth/login']);
    return false;
  }
}
