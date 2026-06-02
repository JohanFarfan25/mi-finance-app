import { Injectable } from '@angular/core';
import { driver, Driver } from 'driver.js';
// NOTE: CSS is loaded via global.scss to ensure it works on native WebView (APK/IPA)

@Injectable({
  providedIn: 'root',
})
export class TourService {
  private driverObj!: Driver;

  startDashboardTour(): void {
    this.driverObj = driver({
      showProgress: true,
      allowClose: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      overlayColor: '#0f172a',
      overlayOpacity: 0.65,

      steps: [
        {
          element: '#menu-button',
          popover: {
            title: 'Menú Principal',
            description:
              'Desde aquí podrás acceder a todos los módulos de la aplicación.',
          },
        },

        {
          element: '#nav-home',
          popover: {
            title: 'Dashboard',
            description: 'Consulta tu balance general y el resumen financiero.',
          },
        },

        {
          element: '#nav-income',
          popover: {
            title: 'Ingresos',
            description: 'Registra todo el dinero que recibes.',
          },
        },

        {
          element: '#nav-expense',
          popover: {
            title: 'Gastos',
            description: 'Controla todos los gastos realizados.',
          },
        },

        {
          element: '#nav-categories',
          popover: {
            title: 'Categorías',
            description: 'Organiza ingresos y gastos por categorías.',
          },
        },
        {
          element: '#nav-settings',
          popover: {
            title: 'Más Opciones',
            description: 'Accede a presupuestos, reportes, transacciones y configuración.',
          },
        },
        {
          element: '#nav-budgets',
          popover: {
            title: 'Presupuestos',
            description: 'Crea y administra tus presupuestos para mantener tus finanzas bajo control.',
          },
        },

      ],
    });

    this.driverObj.drive();
  }
}
