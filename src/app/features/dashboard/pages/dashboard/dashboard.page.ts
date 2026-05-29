import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton, IonButtons, IonFooter, IonMenuButton } from '@ionic/angular/standalone';
import { AuthService } from '../../../auth/auth.service';
import { TransactionService } from '../../../../core/services/transaction.service';
import { CategoryService } from '../../../../core/services/category.service';
import { User } from '../../../../core/models/user';
import { Transaction } from '../../../../core/models/transaction';

interface QuickAction {
  id: string;
  label: string;
  iconName: string;
  bg: string;
  color: string;
}

interface WeeklyData {
  day: string;
  income: number;
  expense: number;
}

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton, IonButtons, IonFooter, IonMenuButton],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  currentUser: User | null = null;
  currencyCode = 'COP';
  userName = 'Usuario';
  balance = 0;
  totalIncome = 0;
  totalExpense = 0;
  savingsAmount = 0;
  dailyExpense = 0;
  savingsTrend = '';
  dailyTrend = '';
  recentMovements: MovementItem[] = [];
  weeklyData: WeeklyData[] = [];

  quickActions: QuickAction[] = [
    { id: 'income', label: 'Ingresos', iconName: 'add-circle-outline', bg: '#ECFDF5', color: '#059669' },
    { id: 'expense', label: 'Gastos', iconName: 'remove-circle-outline', bg: '#FEF2F2', color: '#DC2626' },
    { id: 'categories', label: 'Categorías', iconName: 'grid-outline', bg: '#EFF6FF', color: '#2563EB' },
    { id: 'budget', label: 'Presup.', iconName: 'wallet-outline', bg: '#FEF3C7', color: '#D97706' }
  ];

  private allTransactions: Transaction[] = [];

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) { }

  async ngOnInit() {
    await this.loadUserData();
    if (this.currentUser) {
      await this.loadCategories();
      await this.loadTransactions();
      this.calculateExtraStats();
      this.generateWeeklyData();
    }
  }

  async loadUserData() {
    this.currentUser = await this.authService.getCurrentUser();
    if (this.currentUser) {
      this.userName = this.currentUser.fullName.split(' ')[0];
      this.currencyCode = this.currentUser.currency;
    }
  }

  async loadCategories() {
    if (this.currentUser) {
      let cats = await this.categoryService.getCategories(this.currentUser.id);
      if (cats.length === 0) {
        await this.categoryService.createDefaultCategories(this.currentUser.id);
      }
    }
  }

  async loadTransactions() {
    if (this.currentUser) {
      this.allTransactions = await this.transactionService.getTransactionsByUserId(this.currentUser.id);
      this.totalIncome = this.allTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      this.totalExpense = this.allTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      this.balance = this.totalIncome - this.totalExpense;
      this.recentMovements = await this.buildMovementItems(this.allTransactions);
    }
  }

  async buildMovementItems(transactions: Transaction[]): Promise<MovementItem[]> {
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const items: MovementItem[] = [];
    for (const t of sorted.slice(0, 5)) {
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

  calculateExtraStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthTx = this.allTransactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const thisMonthIncome = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const thisMonthExpense = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    this.savingsAmount = thisMonthIncome - thisMonthExpense;

    const daysInMonth = now.getDate();
    this.dailyExpense = daysInMonth > 0 ? thisMonthExpense / daysInMonth : 0;

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthTx = this.allTransactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });
    const lastMonthIncome = lastMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const lastMonthExpense = lastMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lastMonthSavings = lastMonthIncome - lastMonthExpense;

    if (lastMonthSavings !== 0) {
      const pct = ((this.savingsAmount - lastMonthSavings) / Math.abs(lastMonthSavings)) * 100;
      this.savingsTrend = (pct >= 0 ? '+' : '') + pct.toFixed(0) + '% vs mes anterior';
    } else if (this.savingsAmount > 0) {
      this.savingsTrend = '+100% vs mes anterior';
    } else {
      this.savingsTrend = 'Sin datos previos';
    }

    const lastMonthDaily = lastMonthExpense > 0 ? lastMonthExpense / 30 : 0;
    if (lastMonthDaily > 0) {
      const pct = ((this.dailyExpense - lastMonthDaily) / lastMonthDaily) * 100;
      this.dailyTrend = (pct >= 0 ? '+' : '') + pct.toFixed(0) + '% vs promedio';
    } else if (this.dailyExpense > 0) {
      this.dailyTrend = 'Sin datos previos';
    } else {
      this.dailyTrend = 'Sin gastos';
    }
  }

  generateWeeklyData() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const dailyIncome: number[] = [0, 0, 0, 0, 0, 0, 0];
    const dailyExpense: number[] = [0, 0, 0, 0, 0, 0, 0];

    for (const t of this.allTransactions) {
      const d = new Date(t.date);
      const diffMs = d.getTime() - monday.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        if (t.type === 'income') {
          dailyIncome[diffDays] += t.amount;
        } else {
          dailyExpense[diffDays] += t.amount;
        }
      }
    }

    const maxVal = Math.max(...dailyIncome, ...dailyExpense, 1);

    this.weeklyData = dayNames.map((day, i) => ({
      day,
      income: (dailyIncome[i] / maxVal) * 100,
      expense: (dailyExpense[i] / maxVal) * 100,
    }));
  }

  get isSavingsPositive(): boolean {
    return this.savingsAmount >= 0;
  }

  get isDailyTrendPositive(): boolean {
    return this.dailyTrend.startsWith('-') || this.dailyTrend === 'Sin gastos';
  }

  onAction(id: string) {
    switch (id) {
      case 'income': this.goToIncome(); break;
      case 'expense': this.goToExpense(); break;
      case 'categories': this.goToCategories(); break;
      case 'budget': this.goToBudgets(); break;
    }
  }

  goToIncome() { window.location.href = '/income'; }
  goToExpense() { window.location.href = '/expense'; }
  goToCategories() { window.location.href = '/categories'; }
  goToSettings() { window.location.href = '/settings'; }
  goToReports() { window.location.href = '/reports'; }
  goToAllMovements() { window.location.href = '/transactions'; }
  goToBudgets() { window.location.href = '/budgets'; }
  goToDashboard() { /* ya estamos en dashboard */ }

  openNotifications() {
    console.log('Abrir notificaciones');
  }

  async logout() {
    await this.authService.logout();
    window.location.href = '/auth/login';
  }
}