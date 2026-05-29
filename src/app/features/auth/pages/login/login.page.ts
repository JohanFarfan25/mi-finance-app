import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton, IonInput, IonCheckbox } from '@ionic/angular/standalone';
import { AuthService } from '../../auth.service';

/**
 * Página de inicio de sesión para la aplicación. Permite a los usuarios ingresar su PIN para autenticarse.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton, IonInput, IonCheckbox],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;
  showPassword = false;
  showError = false;
  usuarioFocused = false;
  pinFocused = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      pin: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  togglePinVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.showError = true;
      setTimeout(() => (this.showError = false), 3000);
      return;
    }
    const success = await this.authService.login(this.loginForm.value.pin);
    if (success) {
      window.location.href = '/dashboard';
    } else {
      this.showError = true;
      setTimeout(() => (this.showError = false), 3000);
    }
  }

  goToRegister() {
    window.location.href = '/auth/register';
  }
}