import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonFooter, IonMenuButton } from '@ionic/angular/standalone';
import { TransactionService } from '../../../../core/services/transaction.service';
import { CategoryService } from '../../../../core/services/category.service';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../../core/models/user';
import { Category } from '../../../../core/models/category';

@Component({
    selector: 'app-income',
    standalone: true,
    imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonFooter, IonMenuButton],
    templateUrl: './income.page.html',
    styleUrls: ['./income.page.scss'],
})
export class IncomePage implements OnInit {
    amount: number | null = null;
    selectedCategoryId: string = '';
    selectedCategoryName: string = '';
    description: string = '';
    isRecurring: boolean = false;
    selectedDate: Date = new Date();

    incomeCategories: Category[] = [];
    currentUser: User | null = null;

    constructor(
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private authService: AuthService
    ) { }

    async ngOnInit() {
        this.currentUser = await this.authService.getCurrentUser();
        if (this.currentUser) await this.loadCategories();
    }

    async loadCategories() {
        if (!this.currentUser) return;
        let all = await this.categoryService.getCategories(this.currentUser.id);
        if (all.length === 0) {
            await this.categoryService.createDefaultCategories(this.currentUser.id);
            all = await this.categoryService.getCategories(this.currentUser.id);
        }
        this.incomeCategories = all.filter(c => c.type === 'income');
    }


    get formattedAmount(): string {
        if (!this.amount || isNaN(this.amount)) return '0';
        return this.amount.toLocaleString('es-CO');
    }

    get formattedDate(): string {
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const d = this.selectedDate;
        return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
    }


    onBlurAmount() {
        if (this.amount === null || isNaN(this.amount)) {
            this.amount = 0;
        }
    }

    formatAmount() {

    }

    selectCategory(id: string, name: string) {
        this.selectedCategoryId = id;
        this.selectedCategoryName = name;
    }

    showCategoryPicker() { }
    openDatePicker() {
        const ds = prompt('Fecha (YYYY-MM-DD)', this.selectedDate.toISOString().split('T')[0]);
        if (ds) this.selectedDate = new Date(ds);
    }

    async saveIncome() {
        if (!this.amount || this.amount <= 0 || !this.selectedCategoryId) {
            alert('Complete el monto (mayor a 0) y seleccione una categoría');
            return;
        }
        if (!this.currentUser) return;
        const tx = {
            userId: this.currentUser.id,
            type: 'income' as const,
            amount: this.amount,
            categoryId: this.selectedCategoryId,
            description: this.description,
            date: this.selectedDate
        };
        try {
            await this.transactionService.addTransaction(tx);
            alert('Ingreso guardado');
            window.location.href = '/dashboard';
        } catch (e) {
            console.error(e);
            alert('Error al guardar');
        }
    }

    goBack() { window.location.href = '/dashboard'; }
    goToDashboard() { window.location.href = '/dashboard'; }
    goToExpense() { window.location.href = '/expense'; }
    goToIncome() { window.location.href = '/income'; }
    goToCategories() { window.location.href = '/categories'; }
    goToSettings() { window.location.href = '/settings'; }
}