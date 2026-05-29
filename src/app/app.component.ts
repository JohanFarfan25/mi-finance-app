import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import {
    IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, IonFooter, IonButton,
    IonButtons, MenuController, IonMenuButton
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from './features/auth/auth.service';
import { AppBottomNavComponent } from './shared/components/app-bottom-nav/app-bottom-nav.component';
import { filter } from 'rxjs';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
        IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, IonFooter, IonButton,
        IonButtons, IonMenuButton,
        CommonModule,
        AppBottomNavComponent,
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    currentUrl = '';
    showShellHeader = false;
    showBottomNav = false;

    menuItems = [
        { title: 'Inicio', icon: 'home-outline', url: '/dashboard' },
        { title: 'Ingresos', icon: 'add-circle-outline', url: '/income' },
        { title: 'Gastos', icon: 'remove-circle-outline', url: '/expense' },
        { title: 'Categorías', icon: 'pricetags-outline', url: '/categories' },
        { title: 'Presupuestos', icon: 'pie-chart-outline', url: '/budgets' },
        { title: 'Reportes', icon: 'bar-chart-outline', url: '/reports' },
        { title: 'Configuración', icon: 'settings-outline', url: '/settings' }
    ];

    constructor(
        private router: Router,
        private authService: AuthService,
        private menuCtrl: MenuController,
    ) {
        this.updateShellState(this.router.url);

        this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
            this.updateShellState(e.urlAfterRedirects);
        });
    }

    private updateShellState(url: string): void {
        this.currentUrl = url;
        const isAuthRoute = url.startsWith('/auth');
        this.showShellHeader = !isAuthRoute;
        this.showBottomNav = !isAuthRoute;
    }

    navigateTo(url: string) {
        this.router.navigateByUrl(url);
        this.menuCtrl.close('main-menu');
    }

    isActive(url: string): boolean {
        return this.currentUrl === url;
    }

    closeMenu() {
        this.menuCtrl.close('main-menu');
    }

    logout() {
        this.authService.logout();
        this.router.navigateByUrl('/auth/login');
        this.menuCtrl.close('main-menu');
    }
}