import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, IonFooter, IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from './features/auth/auth.service';
import { filter } from 'rxjs';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
        IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, IonFooter, IonButton,
        CommonModule
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    currentUrl = '';

    menuItems = [
        { title: 'Inicio', icon: 'home-outline', url: '/dashboard' },
        { title: 'Ingresos', icon: 'add-circle-outline', url: '/income' },
        { title: 'Gastos', icon: 'remove-circle-outline', url: '/expense' },
        { title: 'Categorías', icon: 'pricetags-outline', url: '/categories' },
        { title: 'Presupuestos', icon: 'pie-chart-outline', url: '/budgets' },
        { title: 'Reportes', icon: 'bar-chart-outline', url: '/reports' },
        { title: 'Configuración', icon: 'settings-outline', url: '/settings' }
    ];

    constructor(private router: Router, private authService: AuthService) {
        this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
            this.currentUrl = e.url;
        });
    }

    navigateTo(url: string) {
        window.location.href = url;
    }

    isActive(url: string): boolean {
        return this.currentUrl === url;
    }

    logout() {
        this.authService.logout();
        window.location.href = '/auth/login';
    }
}