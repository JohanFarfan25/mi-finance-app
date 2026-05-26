import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

/**
 * Protector de autenticación para proteger rutas que requieren que el usuario esté autenticado.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private storageService: StorageService,
    private router: Router,
  ) {}

  //** Verifica si el usuario está autenticado */
  async canActivate(): Promise<boolean> {
    const user = await this.storageService.get('currentUser');
    if (user) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
