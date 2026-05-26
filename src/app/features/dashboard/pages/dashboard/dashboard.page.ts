import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h1>Dashboard - Próximamente</h1>
      <p>Bienvenido a my-finance-app</p>
      <ion-button expand="block" (click)="logout()" color="danger">Cerrar sesión</ion-button>
    </ion-content>
  `
})
export class DashboardPage {
  constructor(private authService: AuthService, private router: Router) {}

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }
}