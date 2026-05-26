import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { CategoryService } from '../../../../core/services/category.service';
import { TransactionService } from '../../../../core/services/transaction.service';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../../core/models/user';
import { CategoryFormModalComponent } from '../../components/category-form-modal/category-form-modal.component';

interface CategoryDisplay {
    id: string;
    name: string;
    icon: string;
    color: string;
    backgroundColor: string;
    transactionCount: number;
    totalAmount: number;
}

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [CommonModule, IonicModule],
    templateUrl: './categories.page.html',
    styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {
    categories: CategoryDisplay[] = [];
    currentUser: User | null = null;
    currencyCode = 'COP';

    constructor(
        private categoryService: CategoryService,
        private transactionService: TransactionService,
        private authService: AuthService,
        private modalCtrl: ModalController
    ) { }

    async ngOnInit() {
        this.currentUser = await this.authService.getCurrentUser();
        if (this.currentUser) {
            this.currencyCode = this.currentUser.currency;
            await this.loadData();
        }
    }

    async loadData() {
        if (!this.currentUser) return;
        const transactions = await this.transactionService.getTransactionsByUserId(this.currentUser.id);
        let categories = await this.categoryService.getCategories(this.currentUser.id);
        if (categories.length === 0) {
            await this.categoryService.createDefaultCategories(this.currentUser.id);
            categories = await this.categoryService.getCategories(this.currentUser.id);
        }
        this.categories = categories.map(cat => {
            const related = transactions.filter(tx => tx.categoryId === cat.id);
            const total = related.reduce((sum, tx) => sum + tx.amount, 0);
            return {
                id: cat.id,
                name: cat.name,
                icon: cat.icon,
                color: cat.color,
                backgroundColor: this.hexToRgba(cat.color, 0.15),
                transactionCount: related.length,
                totalAmount: total
            };
        });
    }

    hexToRgba(hex: string, alpha: number): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    async createCategory() {
        const modal = await this.modalCtrl.create({
            component: CategoryFormModalComponent,
        });
        modal.onDidDismiss().then(async (result) => {
            if (result.data) {
                const newCat = { ...result.data, userId: this.currentUser!.id, isDefault: false };
                await this.categoryService.addCategory(newCat);
                // Recargar la página para evitar problemas de foco
                window.location.reload();
            }
        });
        await modal.present();
    }

    async editCategory(cat: CategoryDisplay) {
        const original = await this.categoryService.getCategoryById(cat.id, this.currentUser!.id);
        if (!original) return;
        const modal = await this.modalCtrl.create({
            component: CategoryFormModalComponent,
            componentProps: { category: { ...original }, isEdit: true }
        });
        modal.onDidDismiss().then(async (result) => {
            if (result.data) {
                await this.categoryService.updateCategory(cat.id, result.data);
                window.location.reload();
            }
        });
        await modal.present();
    }

    async deleteCategory(id: string) {
        const alert = document.createElement('ion-alert');
        alert.header = 'Confirmar';
        alert.message = '¿Eliminar esta categoría? Las transacciones asociadas quedarán sin categoría.';
        alert.buttons = [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Eliminar', handler: async () => {
                    await this.categoryService.deleteCategory(id);
                    window.location.reload();
                }
            }
        ];
        document.body.appendChild(alert);
        await alert.present();
    }

    viewCategory(cat: CategoryDisplay) {
        window.location.href = `/category-detail?id=${cat.id}`;
    }

    openSearch() {
        alert('Búsqueda de categorías (próximamente)');
    }


    goToDashboard() { window.location.href = '/dashboard'; }
    goToIncome() { window.location.href = '/income'; }
    goToExpense() { window.location.href = '/expense'; }
    goToCategories() { window.location.href = '/categories'; }
    goToSettings() { window.location.href = '/settings'; }
}