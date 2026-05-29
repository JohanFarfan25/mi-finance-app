import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton, IonFooter, IonMenuButton, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/angular/standalone';
import { TransactionService } from '../../../../core/services/transaction.service';
import { CategoryService } from '../../../../core/services/category.service';
import { AuthService } from '../../../auth/auth.service';
import { Transaction } from '../../../../core/models/transaction';
import { User } from '../../../../core/models/user';

interface MovementItem {
    id: string;
    description: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    amount: number;
    type: 'income' | 'expense';
    date: Date;
}

@Component({
    selector: 'app-transaction-list',
    standalone: true,
    imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton, IonFooter, IonMenuButton, IonItemSliding, IonItemOptions, IonItemOption],
    templateUrl: './transaction-list.page.html',
    styleUrls: ['./transaction-list.page.scss'],
})
export class TransactionListPage implements OnInit {
    currentUser: User | null = null;
    currencyCode = 'COP';
    movements: MovementItem[] = [];
    filteredMovements: MovementItem[] = [];
    selectedFilter: 'all' | 'income' | 'expense' = 'all';

    constructor(
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private authService: AuthService,
        private alertController: AlertController
    ) { }

    async ionViewWillEnter() {
        await this.loadData();
    }

    async ngOnInit() {
        // Init happens once, loadData handles refresh in ionViewWillEnter
    }

    async loadData() {
        this.currentUser = await this.authService.getCurrentUser();
        if (this.currentUser) {
            this.currencyCode = this.currentUser.currency;
            const transactions = await this.transactionService.getTransactionsByUserId(this.currentUser.id);
            this.movements = await this.buildMovementItems(transactions);
            this.applyFilter(this.selectedFilter);
        }
    }

    async buildMovementItems(transactions: Transaction[]): Promise<MovementItem[]> {
        const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const items: MovementItem[] = [];
        for (const t of sorted) {
            const cat = await this.categoryService.getCategoryById(t.categoryId, this.currentUser!.id);
            items.push({
                id: t.id,
                description: t.description,
                categoryName: cat?.name || 'General',
                categoryIcon: cat?.icon || 'help-circle-outline',
                categoryColor: cat?.color || '#94A3B8',
                amount: t.amount,
                type: t.type,
                date: t.date
            });
        }
        return items;
    }

    applyFilter(filter: 'all' | 'income' | 'expense') {
        this.selectedFilter = filter;
        if (filter === 'all') {
            this.filteredMovements = [...this.movements];
        } else {
            this.filteredMovements = this.movements.filter(m => m.type === filter);
        }
    }

    async deleteMovement(id: string) {
        const alert = await this.alertController.create({
            header: 'Eliminar movimiento',
            message: '¿Estás seguro de que deseas eliminar este movimiento?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                    text: 'Eliminar',
                    cssClass: 'danger',
                    handler: async () => {
                        await this.transactionService.deleteTransaction(id);
                        await this.loadData();
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
