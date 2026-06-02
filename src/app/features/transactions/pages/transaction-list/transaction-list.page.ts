import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    AlertController,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonButton,
    IonFooter,
    IonMenuButton,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonInput
} from '@ionic/angular/standalone';
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
    imports: [
        CommonModule,
        FormsModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonList,
        IonItem,
        IonIcon,
        IonLabel,
        IonButton,
        IonFooter,
        IonMenuButton,
        IonItemSliding,
        IonItemOptions,
        IonItemOption,
        IonInput
    ],
    templateUrl: './transaction-list.page.html',
    styleUrls: ['./transaction-list.page.scss'],
})
export class TransactionListPage implements OnInit {
    currentUser: User | null = null;
    currencyCode = 'COP';
    movements: MovementItem[] = [];
    filteredMovements: MovementItem[] = [];
    selectedFilter: 'all' | 'income' | 'expense' = 'all';

    searchTerm: string = '';
    currentPage: number = 1;
    itemsPerPage: number = 10;
    totalPages: number = 1;

    get paginatedMovements(): MovementItem[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredMovements.slice(startIndex, endIndex);
    }

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

    }

    async loadData() {
        this.currentUser = await this.authService.getCurrentUser();
        if (this.currentUser) {
            this.currencyCode = this.currentUser.currency;
            const transactions = await this.transactionService.getTransactionsByUserId(this.currentUser.id);
            this.movements = await this.buildMovementItems(transactions);
            this.applyFilter(this.selectedFilter);
            this.resetPagination();
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
        let filtered = [...this.movements];
        if (filter !== 'all') {
            filtered = filtered.filter(m => m.type === filter);
        }

        if (this.searchTerm) {
            filtered = this.applySearchFilter(filtered);
        }

        this.filteredMovements = filtered;
        this.resetPagination();
    }


    onSearchChange(value: string) {
        this.searchTerm = value;
        let filtered = [...this.movements];


        if (this.selectedFilter !== 'all') {
            filtered = filtered.filter(m => m.type === this.selectedFilter);
        }

        if (this.searchTerm) {
            filtered = this.applySearchFilter(filtered);
        }

        this.filteredMovements = filtered;
        this.resetPagination();
    }

    applySearchFilter(items: MovementItem[]): MovementItem[] {
        const term = this.searchTerm.toLowerCase().trim();
        if (!term) return items;

        return items.filter(item =>
            item.description.toLowerCase().includes(term) ||
            item.categoryName.toLowerCase().includes(term)
        );
    }

    clearSearch() {
        this.searchTerm = '';
        this.onSearchChange('');
    }


    resetPagination() {
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredMovements.length / this.itemsPerPage);
        if (this.totalPages === 0) this.totalPages = 1;
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    goToPage(page: number) {
        this.currentPage = page;
    }

    getCurrentPageEnd(): number {
        const end = this.currentPage * this.itemsPerPage;
        return Math.min(end, this.filteredMovements.length);
    }

    getPageNumbers(): number[] {
        const pages: number[] = [];
        const maxVisible = 5;

        if (this.totalPages <= maxVisible) {

            for (let i = 1; i <= this.totalPages; i++) {
                pages.push(i);
            }
        } else {

            const leftSide = Math.floor(maxVisible / 2);
            let start = Math.max(this.currentPage - leftSide, 1);
            let end = Math.min(start + maxVisible - 1, this.totalPages);

            if (end - start + 1 < maxVisible) {
                start = Math.max(end - maxVisible + 1, 1);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }

        return pages;
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
