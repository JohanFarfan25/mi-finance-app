import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonFooter,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { TransactionService } from '../../../../core/services/transaction.service';
import { CategoryService } from '../../../../core/services/category.service';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../../core/models/user';
import { Category } from '../../../../core/models/category';
import { IonDatetime, IonModal } from '@ionic/angular/standalone';

@Component({
  selector: 'app-expense',
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
    IonInput,
    IonSelect,
    IonSelectOption,
    IonFooter,
    IonMenuButton,
    IonDatetime,
    IonModal,
  ],
  templateUrl: './expense.page.html',
  styleUrls: ['./expense.page.scss'],
})
export class ExpensePage implements OnInit {
  amount: number | null = null;
  selectedCategoryId: string = '';
  selectedCategoryName: string = '';
  description: string = '';
  selectedDate: Date = new Date();
  selectedPayment: string = 'Efectivo';

  expenseCategories: Category[] = [];
  currentUser: User | null = null;
  paymentMethods: string[] = ['Efectivo', 'Tarjeta', 'Nequi', 'Transfer.'];
  isDateModalOpen = false;
  isEditing: boolean = false;
  editingTransactionId: string = '';

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private authService: AuthService,
  ) {}

  async ngOnInit() {
    this.currentUser = await this.authService.getCurrentUser();
    if (this.currentUser) {
      await this.loadCategories();

      const params = new URLSearchParams(window.location.search);
      const editId = params.get('id');
      if (editId) {
        this.isEditing = true;
        this.editingTransactionId = editId;
        await this.loadTransactionForEditing(editId);
      }
    }
  }

  async loadTransactionForEditing(id: string) {
    if (!this.currentUser) return;
    const transactions = await this.transactionService.getTransactionsByUserId(this.currentUser.id);
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      this.amount = tx.amount;
      this.selectedCategoryId = tx.categoryId;
      this.description = tx.description;
      this.selectedDate = new Date(tx.date);

      const cat = await this.categoryService.getCategoryById(tx.categoryId, this.currentUser.id);
      this.selectedCategoryName = cat?.name || 'General';
    }
  }

  async loadCategories() {
    if (!this.currentUser) return;
    let all = await this.categoryService.getCategories(this.currentUser.id);
    if (all.length === 0) {
      await this.categoryService.createDefaultCategories(this.currentUser.id);
      all = await this.categoryService.getCategories(this.currentUser.id);
    }
    this.expenseCategories = all.filter((c) => c.type === 'expense');
  }

  get formattedAmount(): string {
    if (!this.amount || isNaN(this.amount)) return '0';
    return this.amount.toLocaleString('es-CO'); // separadores de miles
  }

  get formattedDate(): string {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const d = this.selectedDate;
    return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
  }

  onBlurAmount() {
    if (this.amount === null || isNaN(this.amount)) this.amount = 0;
  }

  formatAmount() {}

  selectCategory(id: string, name: string) {
    this.selectedCategoryId = id;
    this.selectedCategoryName = name;
  }
  selectPayment(method: string) {
    this.selectedPayment = method;
  }
  showCategoryPicker() {}
  openDatePicker() {
    this.isDateModalOpen = true;
  }

  onDateChange(event: any) {
    if (event.detail.value) {
      this.selectedDate = new Date(event.detail.value);
    }
  }

  async saveExpense() {
    if (!this.amount || this.amount <= 0 || !this.selectedCategoryId) {
      alert('Complete el monto (mayor a 0) y seleccione una categoría');
      return;
    }
    if (!this.currentUser) return;
    try {
      if (this.isEditing) {
        await this.transactionService.updateTransaction(this.editingTransactionId, {
          amount: this.amount,
          categoryId: this.selectedCategoryId,
          description: this.description,
          date: this.selectedDate,
        });
        alert('Gasto actualizado');
        window.location.href = '/transactions';
      } else {
        const tx = {
          userId: this.currentUser.id,
          type: 'expense' as const,
          amount: this.amount,
          categoryId: this.selectedCategoryId,
          description: this.description,
          date: this.selectedDate,
        };
        await this.transactionService.addTransaction(tx);
        alert('Gasto registrado');
        window.location.href = '/dashboard';
      }
    } catch (e) {
      console.error(e);
      alert('Error al guardar');
    }
  }

  goBack() {
    if (this.isEditing) {
      window.location.href = '/transactions';
    } else {
      window.location.href = '/dashboard';
    }
  }
  goToDashboard() {
    window.location.href = '/dashboard';
  }
  goToIncome() {
    window.location.href = '/income';
  }
  goToCategories() {
    window.location.href = '/categories';
  }
  goToSettings() {
    window.location.href = '/settings';
  }
  goToExpense() {
    window.location.href = '/expense';
  }
}
