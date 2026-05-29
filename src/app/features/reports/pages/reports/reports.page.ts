import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton, IonFooter, IonMenuButton } from '@ionic/angular/standalone';
import { TransactionService } from '../../../../core/services/transaction.service';
import { CategoryService } from '../../../../core/services/category.service';
import { AuthService } from '../../../auth/auth.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton, IonFooter, IonMenuButton],
    templateUrl: './reports.page.html',
    styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
    selectedPeriod = 'Mensual';
    chartData: { label: string; income: number; expense: number }[] = [];
    categoryBreakdown: { name: string; amount: number; percentage: number; color: string }[] = [];
    currentUser: any = null;
    allTransactions: any[] = [];
    categories: any[] = [];
    comparisonStats: any[] = [];
    historyData: any[] = [];

    currentBalance = 0;
    currentIncome = 0;
    currentExpense = 0;
    balanceChangeStr = '';
    isBalancePositive = true;

    constructor(
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private authService: AuthService,
        private sanitizer: DomSanitizer
    ) { }

    async ngOnInit() {
        this.currentUser = await this.authService.getCurrentUser();
        if (this.currentUser) await this.loadData();
    }

    async loadData() {
        if (!this.currentUser) return;
        this.allTransactions = await this.transactionService.getTransactionsByUserId(this.currentUser.id);
        this.categories = await this.categoryService.getCategories(this.currentUser.id);

        this.calculatePeriodData();
    }

    selectPeriod(period: string) {
        this.selectedPeriod = period;
        this.calculatePeriodData();
    }

    calculatePeriodData() {
        const now = new Date();
        let start = new Date();
        let end = new Date();
        let prevStart = new Date();
        let prevEnd = new Date();

        if (this.selectedPeriod === 'Semanal') {
            const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0, Sun=6
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dayOfWeek));
            prevStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() - 7);
            prevEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 7);
        } else if (this.selectedPeriod === 'Mensual') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (this.selectedPeriod === 'Anual') {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31);
            prevStart = new Date(now.getFullYear() - 1, 0, 1);
            prevEnd = new Date(now.getFullYear() - 1, 11, 31);
        }

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        prevStart.setHours(0, 0, 0, 0);
        prevEnd.setHours(23, 59, 59, 999);

        // Balance & Trend
        const currentTxs = this.allTransactions.filter(tx => {
            const d = new Date(tx.date).getTime();
            return d >= start.getTime() && d <= end.getTime();
        });
        const prevTxs = this.allTransactions.filter(tx => {
            const d = new Date(tx.date).getTime();
            return d >= prevStart.getTime() && d <= prevEnd.getTime();
        });

        this.currentIncome = currentTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        this.currentExpense = currentTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        this.currentBalance = this.currentIncome - this.currentExpense;

        const prevIncome = prevTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const prevExpense = prevTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const prevBalance = prevIncome - prevExpense;

        if (prevBalance !== 0) {
            const change = ((this.currentBalance - prevBalance) / Math.abs(prevBalance)) * 100;
            this.balanceChangeStr = (change > 0 ? '+' : '') + change.toFixed(1) + '%';
            this.isBalancePositive = change >= 0;
        } else if (this.currentBalance !== 0) {
            this.balanceChangeStr = '+100%';
            this.isBalancePositive = true;
        } else {
            this.balanceChangeStr = '0%';
            this.isBalancePositive = true;
        }

        // Methods to populate other cards
        this.generateChartData(now, start);
        this.generateCategoryBreakdown(currentTxs);
        this.generateComparisonStats(prevIncome, prevExpense);
        this.generateHistoryData(now);
    }

    generateChartData(now: Date, periodStart: Date) {
        const data = [];
        if (this.selectedPeriod === 'Semanal') {
            const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            for (let i = 0; i < 7; i++) {
                const d = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate() + i);
                data.push({ label: days[i], date: d.getTime(), income: 0, expense: 0 });
            }
            for (const tx of this.allTransactions) {
                const txDate = new Date(tx.date);
                txDate.setHours(0, 0, 0, 0);
                const dayObj = data.find(d => d.date === txDate.getTime());
                if (dayObj) {
                    if (tx.type === 'income') dayObj.income += tx.amount;
                    else dayObj.expense += tx.amount;
                }
            }
        } else if (this.selectedPeriod === 'Mensual') {
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                data.push({
                    label: d.toLocaleDateString('es', { month: 'short' }),
                    year: d.getFullYear(),
                    month: d.getMonth(),
                    income: 0,
                    expense: 0
                });
            }
            for (const tx of this.allTransactions) {
                const d = new Date(tx.date);
                const m = data.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
                if (m) {
                    if (tx.type === 'income') m.income += tx.amount;
                    else m.expense += tx.amount;
                }
            }
        } else {
            for (let i = 4; i >= 0; i--) {
                const year = now.getFullYear() - i;
                data.push({ label: year.toString(), year: year, income: 0, expense: 0 });
            }
            for (const tx of this.allTransactions) {
                const year = new Date(tx.date).getFullYear();
                const y = data.find(d => d.year === year);
                if (y) {
                    if (tx.type === 'income') y.income += tx.amount;
                    else y.expense += tx.amount;
                }
            }
        }
        this.chartData = data;
    }

    generateCategoryBreakdown(currentTxs: any[]) {
        const expenseTxs = currentTxs.filter(tx => tx.type === 'expense');
        const map = new Map<string, { amount: number, color: string }>();

        for (const tx of expenseTxs) {
            const cat = this.categories.find(c => c.id === tx.categoryId);
            const name = cat ? cat.name : 'Otros';
            const color = cat ? cat.color : '#94A3B8';

            const existing = map.get(name);
            if (existing) {
                existing.amount += tx.amount;
            } else {
                map.set(name, { amount: tx.amount, color: color });
            }
        }

        const total = Array.from(map.values()).reduce((a, b) => a + b.amount, 0);
        const items = Array.from(map.entries()).map(([name, data]) => ({
            name,
            amount: data.amount,
            percentage: total ? (data.amount / total) * 100 : 0,
            color: data.color
        }));

        items.sort((a, b) => b.amount - a.amount);
        const top5 = items.slice(0, 5);
        const otherAmount = items.slice(5).reduce((s, i) => s + i.amount, 0);
        if (otherAmount > 0) {
            top5.push({ name: 'Otros', amount: otherAmount, percentage: (otherAmount / total) * 100, color: '#94A3B8' });
        }
        this.categoryBreakdown = top5;
    }

    generateComparisonStats(prevIncome: number, prevExpense: number) {
        const incomeChange = prevIncome ? ((this.currentIncome - prevIncome) / prevIncome) * 100 : (this.currentIncome > 0 ? 100 : 0);
        const expenseChange = prevExpense ? ((this.currentExpense - prevExpense) / prevExpense) * 100 : (this.currentExpense > 0 ? 100 : 0);

        this.comparisonStats = [
            {
                label: 'Ingresos',
                current: this.formatCurrency(this.currentIncome),
                previous: this.formatCurrency(prevIncome),
                change: (incomeChange > 0 ? '+' : '') + incomeChange.toFixed(1) + '%',
                positive: incomeChange >= 0
            },
            {
                label: 'Gastos',
                current: this.formatCurrency(this.currentExpense),
                previous: this.formatCurrency(prevExpense),
                change: (expenseChange > 0 ? '+' : '') + expenseChange.toFixed(1) + '%',
                positive: expenseChange <= 0
            },
            {
                label: 'Ahorro',
                current: this.formatCurrency(this.currentBalance),
                previous: this.formatCurrency(prevIncome - prevExpense),
                change: '—',
                positive: true
            }
        ];
    }

    generateHistoryData(now: Date) {
        const history = [];

        if (this.selectedPeriod === 'Semanal') {
            const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
            for (let i = 1; i <= 3; i++) {
                const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 1 - ((i - 1) * 7));
                const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);

                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);

                const txs = this.allTransactions.filter(tx => {
                    const t = new Date(tx.date).getTime();
                    return t >= start.getTime() && t <= end.getTime();
                });
                const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                const bal = inc - exp;

                const label = `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
                history.push({ month: label, balance: this.formatCurrency(bal), trend: bal >= 0 ? 'up' : 'down' });
            }
        } else if (this.selectedPeriod === 'Mensual') {
            for (let i = 1; i <= 3; i++) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const start = new Date(d.getFullYear(), d.getMonth(), 1);
                const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

                const txs = this.allTransactions.filter(tx => {
                    const t = new Date(tx.date).getTime();
                    return t >= start.getTime() && t <= end.getTime();
                });
                const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                const bal = inc - exp;

                const label = d.toLocaleDateString('es', { month: 'long', year: 'numeric' });
                history.push({ month: label.charAt(0).toUpperCase() + label.slice(1), balance: this.formatCurrency(bal), trend: bal >= 0 ? 'up' : 'down' });
            }
        } else {
            for (let i = 1; i <= 3; i++) {
                const year = now.getFullYear() - i;
                const start = new Date(year, 0, 1);
                const end = new Date(year, 11, 31, 23, 59, 59);

                const txs = this.allTransactions.filter(tx => {
                    const t = new Date(tx.date).getTime();
                    return t >= start.getTime() && t <= end.getTime();
                });
                const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                const bal = inc - exp;

                history.push({ month: year.toString(), balance: this.formatCurrency(bal), trend: bal >= 0 ? 'up' : 'down' });
            }
        }
        this.historyData = history;
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
    }

    get maxIncome(): number {
        return Math.max(...this.chartData.map(d => Math.max(d.income, d.expense)), 1);
    }

    get donutGradient(): SafeStyle {
        if (this.categoryBreakdown.length === 0) {
            return this.sanitizer.bypassSecurityTrustStyle(`conic-gradient(#E2E8F0 0% 100%)`);
        }
        let total = 0;
        const segments = this.categoryBreakdown.map(c => {
            const prev = total;
            total += c.percentage;
            // Fix formatting of percentage string without decimals
            return `${c.color} ${prev.toFixed(2)}% ${total.toFixed(2)}%`;
        });
        return this.sanitizer.bypassSecurityTrustStyle(`conic-gradient(${segments.join(', ')})`);
    }

    goToDashboard() { window.location.href = '/dashboard'; }
    goToIncome() { window.location.href = '/income'; }
    goToExpense() { window.location.href = '/expense'; }
    goToCategories() { window.location.href = '/categories'; }
    goToSettings() { window.location.href = '/settings'; }
}