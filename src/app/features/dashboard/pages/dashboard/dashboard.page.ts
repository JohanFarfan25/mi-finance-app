import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../auth/auth.service';
import { TransactionService } from '../../../../core/services/transaction.service';
import { CategoryService } from '../../../../core/services/category.service';
import { User } from '../../../../core/models/user';
import { Transaction } from '../../../../core/models/transaction';

interface QuickAction {
  id: string;
  label: string;
  iconName: string;   // Nombre del icono de Ionic
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
  imports: [CommonModule, IonicModule],
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
  recentMovements: MovementItem[] = [];
  weeklyData: WeeklyData[] = [];

  // Acciones rápidas con iconos de Ionic
  quickActions: QuickAction[] = [
    { id: 'income', label: 'Ingresos', iconName: 'add-circle-outline', bg: '#ECFDF5', color: '#059669' },
    { id: 'expense', label: 'Gastos', iconName: 'remove-circle-outline', bg: '#FEF2F2', color: '#DC2626' },
    { id: 'categories', label: 'Categorías', iconName: 'grid-outline', bg: '#EFF6FF', color: '#2563EB' },
    { id: 'budget', label: 'Presup.', iconName: 'wallet-outline', bg: '#FEF3C7', color: '#D97706' }
  ];

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
      const transactions = await this.transactionService.getTransactionsByUserId(this.currentUser.id);
      this.totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      this.totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      this.balance = this.totalIncome - this.totalExpense;
      this.recentMovements = await this.buildMovementItems(transactions);
    }
  }

  async buildMovementItems(transactions: Transaction[]): Promise<MovementItem[]> {
    const items: MovementItem[] = [];
    for (const t of transactions.slice(0, 10)) {
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
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  calculateExtraStats() {
    this.savingsAmount = this.balance > 0 ? this.balance : 0;
    this.dailyExpense = this.totalExpense / 30;
  }

  generateWeeklyData() {
    // Datos de ejemplo (luego puedes calcularlos con transacciones reales)
    this.weeklyData = [
      { day: 'Lun', income: 70, expense: 30 },
      { day: 'Mar', income: 45, expense: 55 },
      { day: 'Mie', income: 60, expense: 20 },
      { day: 'Jue', income: 30, expense: 65 },
      { day: 'Vie', income: 80, expense: 40 },
      { day: 'Sab', income: 20, expense: 50 },
      { day: 'Dom', income: 50, expense: 25 }
    ];
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
    // Navegar a página de notificaciones o mostrar modal
    console.log('Abrir notificaciones');
  }

  async logout() {
    await this.authService.logout();
    window.location.href = '/auth/login';
  }
}