import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { AuthService } from '../../../auth/auth.service';
import { StorageService } from '../../../../core/services/storage.service';
import { User } from '../../../../core/models/user';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, IonicModule],
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
    currentUser: User | null = null;
    userName = '';
    userEmail = '';
    memberSince = '';
    currency = 'COP';
    settingsSections: any[] = [];

    constructor(
        private authService: AuthService,
        private storage: StorageService,
        private alertCtrl: AlertController
    ) { }

    async ngOnInit() {
        this.currentUser = await this.authService.getCurrentUser();
        if (this.currentUser) {
            this.userName = this.currentUser.fullName;
            this.userEmail = this.currentUser.email || 'No registrado';
            this.memberSince = new Date(this.currentUser.createdAt).toLocaleDateString('es', { month: 'long', year: 'numeric' });
            this.currency = this.currentUser.currency;
            this.buildSections();
        }
    }

    buildSections() {
        this.settingsSections = [
            {
                title: 'Usuario', items: [
                    { label: 'Perfil', value: this.userName, icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', iconBg: '#EFF6FF', iconColor: '#2563EB' },
                    { label: 'Correo', value: this.userEmail, icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', iconBg: '#F1F5F9', iconColor: '#64748B' },
                    { label: 'Moneda', value: this.currency, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: '#ECFDF5', iconColor: '#059669' },
                    { label: 'Editar datos personales', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', iconBg: '#EFF6FF', iconColor: '#2563EB' }
                ]
            },
            {
                title: 'Seguridad', items: [
                    { label: 'Cambiar PIN', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', iconBg: '#FEF3C7', iconColor: '#D97706' }
                ]
            },
            {
                title: 'Datos', items: [
                    { label: 'Exportar Datos', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', iconBg: '#ECFDF5', iconColor: '#059669' },
                    { label: 'Limpiar Datos', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', iconBg: '#FEF2F2', iconColor: '#EF4444', danger: true }
                ]
            }
        ];
    }

    get userInitials(): string {
        const parts = this.userName.split(' ');
        return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : this.userName.substring(0, 2).toUpperCase();
    }

    async editProfile() {
        const alert = await this.alertCtrl.create({
            header: 'Editar perfil',
            inputs: [
                { name: 'fullName', value: this.userName, placeholder: 'Nombre completo' },
                { name: 'email', value: this.userEmail, placeholder: 'Correo' },
                { name: 'currency', value: this.currency, placeholder: 'COP, USD, EUR' }
            ],
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Guardar', handler: async (data) => {
                        if (this.currentUser) {
                            this.currentUser.fullName = data.fullName;
                            this.currentUser.email = data.email;
                            this.currentUser.currency = data.currency;
                            await this.storage.set('currentUser', this.currentUser);
                            const users = await this.storage.get('registeredUsers') || [];
                            const idx = users.findIndex((u: User) => u.id === this.currentUser!.id);
                            if (idx !== -1) users[idx] = this.currentUser;
                            await this.storage.set('registeredUsers', users);
                            this.userName = data.fullName;
                            this.userEmail = data.email;
                            this.currency = data.currency;
                            this.buildSections();
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    async onSettingTap(item: any) {
        if (item.label === 'Cambiar PIN') {
            window.alert('Funcionalidad en desarrollo'); // ✅ corrige el error de alert
        } else if (item.label === 'Limpiar Datos') {
            const alert = await this.alertCtrl.create({
                header: 'Limpiar datos',
                message: 'Esto eliminará todas tus transacciones, categorías y presupuestos. ¿Continuar?',
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    {
                        text: 'Eliminar', role: 'destructive', handler: async () => {
                            await this.storage.clear();
                            window.alert('Datos eliminados. La aplicación se reiniciará.'); // ✅ corrige
                            window.location.href = '/auth/login';
                        }
                    }
                ]
            });
            await alert.present();
        } else if (item.label === 'Exportar Datos') {
            window.alert('Próximamente');
        }
    }

    async logout() {
        const alert = await this.alertCtrl.create({
            header: 'Cerrar sesión',
            message: '¿Estás seguro?',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Salir', handler: async () => {
                        await this.authService.logout();
                        window.location.href = '/auth/login';
                    }
                }
            ]
        });
        await alert.present();
    }

    goToDashboard() { window.location.href = '/dashboard'; }
    goToIncome() { window.location.href = '/income'; }
    goToExpense() { window.location.href = '/expense'; }
    goToCategories() { window.location.href = '/categories'; }
    goToSettings() { window.location.href = '/settings'; }
}