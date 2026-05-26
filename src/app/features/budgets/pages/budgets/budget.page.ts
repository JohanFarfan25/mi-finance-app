import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BudgetService } from '../../../../core/services/budget.service';
import { CategoryService } from '../../../../core/services/category.service';
import { TransactionService } from '../../../../core/services/transaction.service';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../../core/models/user';
import { Budget } from '../../../../core/models/budget';

interface BudgetDisplay {
    id: string; categoryId: string; name: string; icon: string; color: string;
    spent: number; limit: number; percentage: number; remaining: number; excess: number;
}


@Component({
    selector: 'app-budget',
    standalone: true,
    imports: [CommonModule, IonicModule],
    templateUrl: './budget.page.html',
    styleUrls: ['./budget.page.scss'],
})
export class BudgetPage implements OnInit {
    selectedMonth = new Date().getMonth();
    selectedYear = new Date().getFullYear();
    budgets: BudgetDisplay[] = [];
    currentUser: User | null = null;
    allTransactions: any[] = [];
    categories: any[] = [];
    months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    Math = Math;

    constructor(
        private budgetService: BudgetService,
        private categoryService: CategoryService,
        private transactionService: TransactionService,
        private authService: AuthService
    ) { }

    async ngOnInit() {
        this.currentUser = await this.authService.getCurrentUser();
        if (this.currentUser) await this.loadData();
    }

    async loadData() {
        if (!this.currentUser) return;
        const start = new Date(this.selectedYear, this.selectedMonth, 1);
        const end = new Date(this.selectedYear, this.selectedMonth + 1, 0);
        const allTx = await this.transactionService.getTransactionsByUserId(this.currentUser.id);
        this.allTransactions = allTx.filter(tx => {
            const d = new Date(tx.date);
            return d >= start && d <= end;
        });
        let cats = await this.categoryService.getCategories(this.currentUser.id);
        if (cats.length === 0) {
            await this.categoryService.createDefaultCategories(this.currentUser.id);
            cats = await this.categoryService.getCategories(this.currentUser.id);
        }
        this.categories = cats;
        let budgets = await this.budgetService.getBudgetsByMonth(this.currentUser.id, this.selectedMonth, this.selectedYear);
        this.budgets = await this.buildBudgetDisplays(budgets);
    }

    async buildBudgetDisplays(budgets: Budget[]): Promise<BudgetDisplay[]> {
        const displays: BudgetDisplay[] = [];
        for (const b of budgets) {
            const cat = this.categories.find(c => c.id === b.categoryId);
            if (!cat) continue;
            const spent = this.allTransactions.filter(tx => tx.categoryId === b.categoryId && tx.type === 'expense').reduce((s, t) => s + t.amount, 0);
            const percentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
            displays.push({
                id: b.id, categoryId: b.categoryId, name: cat.name, icon: cat.icon, color: cat.color,
                spent, limit: b.limit, percentage: Math.round(percentage),
                remaining: Math.max(0, b.limit - spent), excess: spent > b.limit ? spent - b.limit : 0
            });
        }
        return displays;
    }

    get selectedMonthLabel() { return `${this.months[this.selectedMonth]} ${this.selectedYear}`; }
    get totalSpent() { return this.budgets.reduce((s, b) => s + b.spent, 0); }
    get totalLimit() { return this.budgets.reduce((s, b) => s + b.limit, 0); }
    get totalRemaining() { return Math.max(0, this.totalLimit - this.totalSpent); }
    get totalPercentage() { return this.totalLimit ? Math.round((this.totalSpent / this.totalLimit) * 100) : 0; }
    get overBudgetItems() { return this.budgets.filter(b => b.excess > 0); }

    prevMonth() {
        if (this.selectedMonth === 0) { this.selectedMonth = 11; this.selectedYear--; }
        else { this.selectedMonth--; }
        this.loadData();
    }
    nextMonth() {
        if (this.selectedMonth === 11) { this.selectedMonth = 0; this.selectedYear++; }
        else { this.selectedMonth++; }
        this.loadData();
    }
    async createBudget() {
        const catId = prompt('ID de categoría (consola para ver ids)'); if (!catId) return;
        const limit = parseFloat(prompt('Límite mensual:') || '0'); if (isNaN(limit)) return;
        await this.budgetService.addBudget({ userId: this.currentUser!.id, categoryId: catId, month: this.selectedMonth, year: this.selectedYear, limit });
        this.loadData();
    }
    viewBudgetDetail(budget: BudgetDisplay) { alert(`Detalle de ${budget.name}`); }

    goToDashboard() { window.location.href = '/dashboard'; }
    goToIncome() { window.location.href = '/income'; }
    goToExpense() { window.location.href = '/expense'; }
    goToBudgets() { window.location.href = '/budgets'; }
    goToCategories() { window.location.href = '/categories'; }
    goToSettings() { window.location.href = '/settings'; }
}