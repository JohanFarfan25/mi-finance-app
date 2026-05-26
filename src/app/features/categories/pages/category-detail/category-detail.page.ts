import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from '../../../../core/services/transaction.service';
import { CategoryService } from '../../../../core/services/category.service';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../../core/models/user';
import { Transaction } from '../../../../core/models/transaction';

@Component({
    selector: 'app-category-detail',
    standalone: true,
    imports: [CommonModule, IonicModule],
    templateUrl: './category-detail.page.html',
    styleUrls: ['./category-detail.page.scss'],
})
export class CategoryDetailPage implements OnInit {
    categoryId: string | null = null;
    categoryName = '';
    categoryIcon = '';
    categoryColor = '';
    categoryBgColor = '';
    transactions: Transaction[] = [];
    currentUser: User | null = null;
    currencyCode = 'COP';
    totalAmount = 0;

    constructor(
        private route: ActivatedRoute,
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private authService: AuthService
    ) { }

    async ngOnInit() {
        this.currentUser = await this.authService.getCurrentUser();
        if (this.currentUser) {
            this.currencyCode = this.currentUser.currency;
        }
        this.categoryId = this.route.snapshot.queryParamMap.get('id');
        if (this.categoryId && this.currentUser) {
            await this.loadCategoryData();
            await this.loadTransactions();
        }
    }

    async loadCategoryData() {
        if (!this.categoryId || !this.currentUser) return;
        const category = await this.categoryService.getCategoryById(this.categoryId, this.currentUser.id);
        if (category) {
            this.categoryName = category.name;
            this.categoryIcon = category.icon;
            this.categoryColor = category.color;
            this.categoryBgColor = this.hexToRgba(category.color, 0.15);
        }
    }

    async loadTransactions() {
        if (!this.currentUser) return;
        const all = await this.transactionService.getTransactionsByUserId(this.currentUser.id);
        this.transactions = all.filter(tx => tx.categoryId === this.categoryId);
        this.totalAmount = this.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    }

    hexToRgba(hex: string, alpha: number): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    goBack() {
        window.location.href = '/categories';
    }

    goToDashboard() { window.location.href = '/dashboard'; }
    goToIncome() { window.location.href = '/income'; }
    goToExpense() { window.location.href = '/expense'; }
    goToCategories() { window.location.href = '/categories'; }
    goToSettings() { window.location.href = '/settings'; }
}