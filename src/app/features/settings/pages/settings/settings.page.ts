import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { AuthService } from '../../../auth/auth.service';
import { StorageService } from '../../../../core/services/storage.service';
import { User } from '../../../../core/models/user';
import { TransactionService } from '../../../../core/services/transaction.service';
import { CategoryService } from '../../../../core/services/category.service';
import { BudgetService } from '../../../../core/services/budget.service';

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
        private alertCtrl: AlertController,
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private budgetService: BudgetService
    ) { }

    async ngOnInit() {
        this.currentUser = await this.authService.getCurrentUser();
        if (this.currentUser) {
            this.userName = this.currentUser.fullName;
            this.userEmail = this.currentUser.email || 'No registrado';
            this.memberSince = new Date(this.currentUser.createdAt).toLocaleDateString('es', {
                month: 'long',
                year: 'numeric',
            });
            this.currency = this.currentUser.currency;
            this.buildSections();
        }
    }

    buildSections() {
        this.settingsSections = [
            {
                title: 'Usuario',
                items: [
                    {
                        label: 'Perfil',
                        value: this.userName,
                        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z',
                        iconBg: '#EFF6FF',
                        iconColor: '#2563EB',
                    },
                    {
                        label: 'Correo',
                        value: this.userEmail,
                        icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
                        iconBg: '#F1F5F9',
                        iconColor: '#64748B',
                    },
                    {
                        label: 'Moneda',
                        value: this.currency,
                        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                        iconBg: '#ECFDF5',
                        iconColor: '#059669',
                    },
                    {
                        label: 'Editar datos personales',
                        icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
                        iconBg: '#EFF6FF',
                        iconColor: '#2563EB',
                        click: () => this.editProfile(),
                    },
                ],
            },
            {
                title: 'Seguridad',
                items: [
                    {
                        label: 'Cambiar PIN',
                        icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
                        iconBg: '#FEF3C7',
                        iconColor: '#D97706',
                        click: () => this.changePin(),
                    },
                ],
            },
            {
                title: 'Datos',
                items: [
                    {
                        label: 'Exportar Datos',
                        icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
                        iconBg: '#ECFDF5',
                        iconColor: '#059669',
                        click: () => this.exportDataToPdf(),
                    },
                    {
                        label: 'Limpiar Datos',
                        icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
                        iconBg: '#FEF2F2',
                        iconColor: '#EF4444',
                        danger: true,
                    },
                ],
            },
        ];
    }

    get userInitials(): string {
        const parts = this.userName.split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : this.userName.substring(0, 2).toUpperCase();
    }

    // ==================== CAMBIAR PIN ====================
    async changePin() {
        const currentPinAlert = await this.alertCtrl.create({
            header: 'Verificar PIN actual',
            inputs: [
                {
                    name: 'currentPin',
                    type: 'password',
                    placeholder: 'PIN actual',
                },
            ],
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Continuar',
                    handler: async (data) => {
                        const currentPin = data.currentPin;
                        if (!currentPin) {
                            const errorAlert = await this.alertCtrl.create({
                                header: 'Error',
                                message: 'Debes ingresar el PIN actual.',
                                buttons: ['OK'],
                            });
                            await errorAlert.present();
                            return false;
                        }
                        // Verificar PIN actual usando AuthService
                        const isValid = await this.authService.login(currentPin);
                        if (!isValid) {
                            const errorAlert = await this.alertCtrl.create({
                                header: 'Error',
                                message: 'PIN actual incorrecto.',
                                buttons: ['OK'],
                            });
                            await errorAlert.present();
                            return false;
                        }
                        await this.requestNewPin();
                        return true;
                    },
                },
            ],
        });
        await currentPinAlert.present();
    }

    private async requestNewPin() {
        const newPinAlert = await this.alertCtrl.create({
            header: 'Nuevo PIN',
            inputs: [
                {
                    name: 'newPin',
                    type: 'password',
                    placeholder: 'Nuevo PIN',
                },
                {
                    name: 'confirmPin',
                    type: 'password',
                    placeholder: 'Confirmar PIN',
                },
            ],
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Guardar',
                    handler: async (data) => {
                        const newPin = data.newPin;
                        const confirmPin = data.confirmPin;
                        if (!newPin) {
                            const errorAlert = await this.alertCtrl.create({
                                header: 'Error',
                                message: 'El PIN no puede estar vacío.',
                                buttons: ['OK'],
                            });
                            await errorAlert.present();
                            return false;
                        }
                        if (newPin !== confirmPin) {
                            const errorAlert = await this.alertCtrl.create({
                                header: 'Error',
                                message: 'Los PIN no coinciden.',
                                buttons: ['OK'],
                            });
                            await errorAlert.present();
                            return false;
                        }
                        try {
                            await this.authService.changePin(newPin);
                            const successAlert = await this.alertCtrl.create({
                                header: 'Éxito',
                                message: 'PIN actualizado correctamente.',
                                buttons: ['OK'],
                            });
                            await successAlert.present();
                            this.currentUser = await this.authService.getCurrentUser();
                        } catch (error: any) {
                            const errorAlert = await this.alertCtrl.create({
                                header: 'Error',
                                message: error.message || 'No se pudo actualizar el PIN.',
                                buttons: ['OK'],
                            });
                            await errorAlert.present();
                        }
                        return true;
                    },
                },
            ],
        });
        await newPinAlert.present();
    }

    // ==================== EXPORTAR DATOS A PDF ====================
    async exportDataToPdf() {
        if (!this.currentUser) return;

        const loading = await this.alertCtrl.create({
            header: 'Generando PDF',
            message: 'Por favor espera...',
            backdropDismiss: false,
        });
        await loading.present();

        try {
            const { default: html2canvas } = await import('html2canvas');
            const { jsPDF } = await import('jspdf');

            const transactions = await this.transactionService.getTransactionsByUserId(this.currentUser.id);
            const categories = await this.categoryService.getCategories(this.currentUser.id);
            const budgets = await this.budgetService.getBudgetsByUser(this.currentUser.id);

            const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            const balance = totalIncome - totalExpense;

            const formatMoney = (value: number) => value.toLocaleString() + ' ' + this.currency;

            const element = document.createElement('div');
            element.style.width = '800px';
            element.style.padding = '20px';
            element.style.backgroundColor = '#FFFFFF';
            element.style.fontFamily = "'Helvetica Neue', Arial, sans-serif";
            element.style.color = '#1E293B';
            element.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #2563EB; font-size: 28px; margin: 0;">📊 Mi Finanzas</h1>
                <p style="color: #64748B; margin-top: 5px;">Reporte completo de tus movimientos</p>
                </div>
                <div style="background: #F8FAFC; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <p><strong>Usuario:</strong> ${this.userName}</p>
                <p><strong>Email:</strong> ${this.userEmail}</p>
                <p><strong>Moneda:</strong> ${this.currency}</p>
                <p><strong>Fecha del reporte:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 20px; border-radius: 16px; margin-bottom: 20px; color: white;">
                <h2 style="margin: 0 0 10px 0;">Resumen financiero</h2>
                <p style="margin: 5px 0; font-size: 24px; font-weight: bold;">Balance: ${formatMoney(balance)}</p>
                <p style="margin: 5px 0;">Ingresos: ${formatMoney(totalIncome)}</p>
                <p style="margin: 5px 0;">Gastos: ${formatMoney(totalExpense)}</p>
                </div>

                <h2>📋 Últimas transacciones</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <thead><tr style="background: #F1F5F9;"><th>Fecha</th><th>Descripción</th><th>Categoría</th><th>Monto</th></tr></thead>
                <tbody>
                    ${transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map(
                        (t) => `
                    <tr>
                        <td style="border:1px solid #E2E8F0;padding:8px;">${new Date(t.date).toLocaleDateString()}</td>
                        <td style="border:1px solid #E2E8F0;padding:8px;">${t.description}</td>
                        <td style="border:1px solid #E2E8F0;padding:8px;">${categories.find(c => c.id === t.categoryId)?.name || 'Sin categoría'}</td>
                        <td style="border:1px solid #E2E8F0;padding:8px;${t.type === 'income' ? 'color:#10B981;' : 'color:#EF4444;'}">${t.type === 'income' ? '+' : '-'} ${formatMoney(t.amount)}</td>
                    </tr>
                    `)
                    .join('')}
                </tbody>
                </table>

                <h2>🏷️ Categorías</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <thead><tr style="background: #F1F5F9;"><th>Nombre</th><th>Tipo</th></tr></thead>
                <tbody>
                    ${categories.map(c => `<tr><td style="border:1px solid #E2E8F0;padding:8px;">${c.name}</td><td style="border:1px solid #E2E8F0;padding:8px;">${c.type === 'income' ? 'Ingreso' : 'Gasto'}</td></tr>`).join('')}
                </tbody>
                </table>

                <h2>💰 Presupuestos por categoría</h2>
                ${budgets.length === 0 ? '<p>No hay presupuestos registrados.</p>' : `
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                    <thead><tr style="background: #F1F5F9;"><th>Categoría</th><th>Límite mensual</th></tr></thead>
                    <tbody>
                    ${budgets.map(b => {
                        const cat = categories.find(c => c.id === b.categoryId);
                        return `<tr><td style="border:1px solid #E2E8F0;padding:8px;">${cat?.name || 'Eliminada'}</td><td style="border:1px solid #E2E8F0;padding:8px;">${formatMoney(b.limit)}</td></tr>`;
                    }).join('')}
                    </tbody>
                </table>
                `}
                <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #94A3B8;">
                Generado por My Finance App - ${new Date().toLocaleString()}
                </div>
            `;

            document.body.appendChild(element);
            const canvas = await html2canvas(element, { scale: 2, logging: false, backgroundColor: '#FFFFFF' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 190;
            const pageHeight = 277;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
            URL.revokeObjectURL(url);
            document.body.removeChild(element);
        } catch (error) {
            console.error('Error al generar PDF:', error);
            const errorAlert = await this.alertCtrl.create({
                header: 'Error',
                message: 'No se pudo generar el PDF. Intenta nuevamente.',
                buttons: ['OK'],
            });
            await errorAlert.present();
        } finally {
            await loading.dismiss();
        }
    }

    // ==================== EDICIÓN DE PERFIL ====================
    async editProfile() {
        const alert = await this.alertCtrl.create({
            header: 'Editar perfil',
            inputs: [
                { name: 'fullName', value: this.userName, placeholder: 'Nombre completo' },
                { name: 'email', value: this.userEmail, placeholder: 'Correo' },
                { name: 'currency', value: this.currency, placeholder: 'COP, USD, EUR' },
            ],
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Guardar',
                    handler: async (data) => {
                        if (this.currentUser) {
                            this.currentUser.fullName = data.fullName;
                            this.currentUser.email = data.email;
                            this.currentUser.currency = data.currency;
                            await this.storage.set('currentUser', this.currentUser);
                            const users = (await this.storage.get('registeredUsers')) || [];
                            const idx = users.findIndex((u: User) => u.id === this.currentUser!.id);
                            if (idx !== -1) users[idx] = this.currentUser;
                            await this.storage.set('registeredUsers', users);
                            this.userName = data.fullName;
                            this.userEmail = data.email;
                            this.currency = data.currency;
                            this.buildSections();
                        }
                    },
                },
            ],
        });
        await alert.present();
    }

    async onSettingTap(item: any) {
        if (item.click && typeof item.click === 'function') {
            item.click();
            return;
        }
        if (item.label === 'Limpiar Datos') {
            const alert = await this.alertCtrl.create({
                header: 'Limpiar datos',
                message: 'Esto eliminará todas tus transacciones, categorías y presupuestos. ¿Continuar?',
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    {
                        text: 'Eliminar',
                        role: 'destructive',
                        handler: async () => {
                            await this.storage.clear();
                            const confirm = await this.alertCtrl.create({
                                header: 'Datos eliminados',
                                message: 'La aplicación se reiniciará.',
                                buttons: ['OK'],
                            });
                            await confirm.present();
                            window.location.href = '/auth/login';
                        },
                    },
                ],
            });
            await alert.present();
        }
    }

    async logout() {
        const alert = await this.alertCtrl.create({
            header: 'Cerrar sesión',
            message: '¿Estás seguro?',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Salir',
                    handler: async () => {
                        await this.authService.logout();
                        window.location.href = '/auth/login';
                    },
                },
            ],
        });
        await alert.present();
    }

    goToDashboard() { window.location.href = '/dashboard'; }
    goToIncome() { window.location.href = '/income'; }
    goToExpense() { window.location.href = '/expense'; }
    goToCategories() { window.location.href = '/categories'; }
    goToSettings() { window.location.href = '/settings'; }
}