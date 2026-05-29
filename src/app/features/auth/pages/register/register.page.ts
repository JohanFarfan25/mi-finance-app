import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { AuthService } from '../../auth.service';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

/**
 * Página de registro para la aplicación. Permite a los nuevos usuarios crear una cuenta ingresando su nombre completo, correo electrónico, moneda preferida y un PIN de seguridad.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  currentStep = 2;
  showPin = false;
  showConfirmPin = false;
  currencies: Currency[] = [
    { code: 'COP', name: 'Peso colombiano', symbol: '$', flag: '🇨🇴' },
    { code: 'USD', name: 'Dólar estadounidense', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'MXN', name: 'Peso mexicano', symbol: '$', flag: '🇲🇽' },
    { code: 'ARS', name: 'Peso argentino', symbol: '$', flag: '🇦🇷' },
  ];

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]],
      currency: ['COP', Validators.required],
      pin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]],
      confirmPin: ['', Validators.required]
    }, { validators: this.pinMatchValidator });
  }

  pinMatchValidator(group: FormGroup) {
    const pin = group.get('pin')?.value;
    const confirm = group.get('confirmPin')?.value;
    return pin === confirm ? null : { mismatch: true };
  }

  getCurrencyName(code: string): string {
    const curr = this.currencies.find(c => c.code === code);
    return curr ? `${curr.code} — ${curr.name}` : 'COP — Peso colombiano';
  }

  togglePinVisibility() {
    this.showPin = !this.showPin;
  }

  toggleConfirmPinVisibility() {
    this.showConfirmPin = !this.showConfirmPin;
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const { fullName, email, currency, pin } = this.registerForm.value;
    try {
      await this.authService.register({ fullName, email, currency }, pin);
      window.location.href = '/dashboard';
    } catch (error: any) {
      const alert = document.createElement('ion-alert');
      alert.header = 'Error';
      alert.message = error.message || 'No se pudo registrar el usuario';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }
  }

  goToLogin() {
    window.location.href = '/auth/login';
  }
}