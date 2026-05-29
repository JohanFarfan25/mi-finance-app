import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { IonFooter, IonToolbar } from '@ionic/angular/standalone';
import { filter } from 'rxjs';

interface NavItem {
  label: string;
  path: string;
  matchPaths: string[];
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, IonFooter, IonToolbar],
  templateUrl: './app-bottom-nav.component.html',
  styleUrls: ['./app-bottom-nav.component.scss'],
})
export class AppBottomNavComponent {
  currentPath = '';

  readonly items: NavItem[] = [
    { label: 'Inicio', path: '/dashboard', matchPaths: ['/dashboard'] },
    { label: 'Ingresos', path: '/income', matchPaths: ['/income'] },
    { label: 'Gastos', path: '/expense', matchPaths: ['/expense'] },
    { label: 'Categorías', path: '/categories', matchPaths: ['/categories', '/category-detail'] },
    { label: 'Más', path: '/settings', matchPaths: ['/settings', '/budgets', '/reports', '/transactions'] },
  ];

  constructor(private router: Router) {
    this.currentPath = this.router.url;
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentPath = e.urlAfterRedirects;
      });
  }

  isActive(item: NavItem): boolean {
    return item.matchPaths.some((p) => this.currentPath === p || this.currentPath.startsWith(p + '?'));
  }

  navigate(path: string): void {
    (document.activeElement as HTMLElement | null)?.blur();
    if (this.currentPath.split('?')[0] !== path) {
      void this.router.navigateByUrl(path);
    }
  }
}
