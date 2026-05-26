import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TransactionService } from '../../../../core/services/transaction.service';
import { CategoryService } from '../../../../core/services/category.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, IonicModule],
    templateUrl: './reports.page.html',
    styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
    selectedPeriod = 'Mensual';
    monthlyData: { month: string; income: number; expense: number }[] = [];
    categoryBreakdown: { name: string; amount: number; percentage: number; color: string }[] = [];
    currentUser: any = null;
    allTransactions: any[] = [];
    categories: any[] = [];
    comparisonStats: any[] = [];
    historyData: any[] = [];

    constructor(
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private authService: AuthService
    ) { }

    async ngOnInit() {
        this.currentUser = await this.authService.getCurrentUser();
        if (this.currentUser) await this.loadData();
    }

    async loadData() {
        if (!this.currentUser) return;
        this.allTransactions = await this.transactionService.getTransactionsByUserId(this.currentUser.id);
        const cats = await this.categoryService.getCategories(this.currentUser.id);
        this.categories = cats;
        this.generateMonthlyReport();
        this.generateCategoryBreakdown();
        this.generateComparisonStats();
        this.generateHistoryData();
    }

    generateMonthlyReport() {
        const now = new Date();
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString('es', { month: 'short' }), income: 0, expense: 0 });
        }
        for (const tx of this.allTransactions) {
            const d = new Date(tx.date);
            const m = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
            if (m) { if (tx.type === 'income') m.income += tx.amount; else m.expense += tx.amount; }
        }
        this.monthlyData = months.map(m => ({ month: m.label, income: m.income, expense: m.expense }));
    }

    generateCategoryBreakdown() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const currentMonthTxs = this.allTransactions.filter(tx => {
            const d = new Date(tx.date);
            return d >= start && d <= end && tx.type === 'expense';
        });
        const map = new Map<string, number>();
        for (const tx of currentMonthTxs) {
            const cat = this.categories.find(c => c.id === tx.categoryId);
            const name = cat ? cat.name : 'Otros';
            map.set(name, (map.get(name) || 0) + tx.amount);
        }
        const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
        const items = Array.from(map.entries()).map(([name, amount]) => ({ name, amount, percentage: total ? (amount / total) * 100 : 0, color: '#94A3B8' }));
        items.sort((a, b) => b.amount - a.amount);
        const top5 = items.slice(0, 5);
        const otherAmount = items.slice(5).reduce((s, i) => s + i.amount, 0);
        if (otherAmount > 0) top5.push({ name: 'Otros', amount: otherAmount, percentage: (otherAmount / total) * 100, color: '#94A3B8' });
        this.categoryBreakdown = top5;
    }

    generateComparisonStats() {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const currentIncome = this.allTransactions.filter(tx => tx.type === 'income' && new Date(tx.date) >= currentMonthStart && new Date(tx.date) <= currentMonthEnd).reduce((s, t) => s + t.amount, 0);
        const currentExpense = this.allTransactions.filter(tx => tx.type === 'expense' && new Date(tx.date) >= currentMonthStart && new Date(tx.date) <= currentMonthEnd).reduce((s, t) => s + t.amount, 0);
        const prevIncome = this.allTransactions.filter(tx => tx.type === 'income' && new Date(tx.date) >= prevMonthStart && new Date(tx.date) <= prevMonthEnd).reduce((s, t) => s + t.amount, 0);
        const prevExpense = this.allTransactions.filter(tx => tx.type === 'expense' && new Date(tx.date) >= prevMonthStart && new Date(tx.date) <= prevMonthEnd).reduce((s, t) => s + t.amount, 0);
        const incomeChange = prevIncome ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;
        const expenseChange = prevExpense ? ((currentExpense - prevExpense) / prevExpense) * 100 : 0;
        this.comparisonStats = [
            { label: 'Ingresos', current: this.formatCurrency(currentIncome), previous: this.formatCurrency(prevIncome), change: (incomeChange >= 0 ? '+' : '') + incomeChange.toFixed(1) + '%', positive: incomeChange >= 0 },
            { label: 'Gastos', current: this.formatCurrency(currentExpense), previous: this.formatCurrency(prevExpense), change: (expenseChange >= 0 ? '+' : '') + expenseChange.toFixed(1) + '%', positive: expenseChange <= 0 },
            { label: 'Ahorro', current: this.formatCurrency(currentIncome - currentExpense), previous: this.formatCurrency(prevIncome - prevExpense), change: '—', positive: true }
        ];
    }

    generateHistoryData() {
        const now = new Date();
        const history = [];
        for (let i = 1; i <= 3; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            const income = this.allTransactions.filter(tx => tx.type === 'income' && new Date(tx.date) >= start && new Date(tx.date) <= end).reduce((s, t) => s + t.amount, 0);
            const expense = this.allTransactions.filter(tx => tx.type === 'expense' && new Date(tx.date) >= start && new Date(tx.date) <= end).reduce((s, t) => s + t.amount, 0);
            const balance = income - expense;
            const monthName = d.toLocaleDateString('es', { month: 'long', year: 'numeric' });
            history.push({ month: monthName, balance: this.formatCurrency(balance), trend: balance >= 0 ? 'up' : 'down' });
        }
        this.historyData = history;
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
    }

    get totalIncome(): number {
        const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), 1); const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return this.allTransactions.filter(tx => tx.type === 'income' && new Date(tx.date) >= start && new Date(tx.date) <= end).reduce((s, t) => s + t.amount, 0);
    }
    get totalExpense(): number {
        const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), 1); const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return this.allTransactions.filter(tx => tx.type === 'expense' && new Date(tx.date) >= start && new Date(tx.date) <= end).reduce((s, t) => s + t.amount, 0);
    }
    get balance(): number { return this.totalIncome - this.totalExpense; }
    get maxIncome(): number { return Math.max(...this.monthlyData.map(d => d.income), 1); }
    get donutGradient(): string {
        let total = 0;
        const segments = this.categoryBreakdown.map(c => { total += c.percentage; return `${c.color} ${total - c.percentage}% ${total}%`; });
        return `conic-gradient(${segments.join(', ')})`;
    }

    selectPeriod(period: string) { this.selectedPeriod = period; this.loadData(); }
    goToDashboard() { window.location.href = '/dashboard'; }
    goToIncome() { window.location.href = '/income'; }
    goToExpense() { window.location.href = '/expense'; }
    goToCategories() { window.location.href = '/categories'; }
    goToSettings() { window.location.href = '/settings'; }
}