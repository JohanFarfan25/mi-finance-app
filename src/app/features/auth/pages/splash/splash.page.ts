import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

/**
 * Página de bienvenida (splash) para la aplicación. Muestra una pantalla de carga mientras verifica si el usuario ya está autenticado y redirige en consecuencia.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    setTimeout(async () => {
      const isAuth = await this.authService.isAuthenticated();
      if (isAuth) {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      } else {
        this.router.navigate(['/auth/register'], { replaceUrl: true });
      }
    }, 1500);
  }
}