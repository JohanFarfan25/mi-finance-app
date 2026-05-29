
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverController, IonList, IonItem, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/auth.service';

@Component({
    selector: 'app-main-menu-popover',
    standalone: true,
    imports: [CommonModule, IonList, IonItem, IonIcon, IonLabel],
    template: `
    <ion-list class="menu-popover">
      <ion-item button (click)="navigateTo('/budgets')">
        <ion-icon name="pie-chart-outline" slot="start"></ion-icon>
        <ion-label>Presupuestos</ion-label>
      </ion-item>
      <ion-item button (click)="navigateTo('/reports')">
        <ion-icon name="bar-chart-outline" slot="start"></ion-icon>
        <ion-label>Reportes</ion-label>
      </ion-item>
      <ion-item button (click)="navigateTo('/categories')">
        <ion-icon name="pricetags-outline" slot="start"></ion-icon>
        <ion-label>Categorías</ion-label>
      </ion-item>
      <ion-item button (click)="navigateTo('/settings')">
        <ion-icon name="settings-outline" slot="start"></ion-icon>
        <ion-label>Configuración</ion-label>
      </ion-item>
      <ion-item button (click)="logout()">
        <ion-icon name="log-out-outline" slot="start" color="danger"></ion-icon>
        <ion-label color="danger">Cerrar sesión</ion-label>
      </ion-item>
    </ion-list>
  `,
    styles: [`
    .menu-popover {
      padding: 0;
      min-width: 180px;
    }
    ion-item {
      --padding-start: 12px;
      --padding-end: 12px;
      --inner-padding-end: 0;
    }
  `]
})
export class MainMenuPopoverComponent {
    constructor(
        private popoverCtrl: PopoverController,
        private router: Router,
        private authService: AuthService
    ) { }

    navigateTo(url: string) {
        this.popoverCtrl.dismiss();
        window.location.href = url;
    }

    async logout() {
        this.popoverCtrl.dismiss();
        await this.authService.logout();
        window.location.href = '/auth/login';
    }
}