import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonListHeader,
  IonLabel,
  IonIcon,
  IonRadioGroup,
  IonItem,
  IonRadio,
  IonInput,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-budget-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonListHeader,
    IonLabel,
    IonIcon,
    IonRadioGroup,
    IonItem,
    IonRadio,
    IonInput,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{
          mode === 'create' ? 'Nuevo presupuesto' : 'Editar presupuesto'
        }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-list-header>
          <ion-label>Selecciona una categoría</ion-label>
        </ion-list-header>
        <ion-radio-group [(ngModel)]="selectedCategoryId">
          <ion-item
            *ngFor="let cat of availableCategories"
            button="true"
            (click)="selectCategory(cat.id)"
            [class.item-selected]="selectedCategoryId === cat.id"
          >
            <ion-icon
              [name]="cat.icon"
              slot="start"
              [style.color]="cat.color"
            ></ion-icon>
            <ion-label>{{ cat.name }}</ion-label>
            <ion-radio slot="end" [value]="cat.id"></ion-radio>
          </ion-item>
        </ion-radio-group>
        <ion-item>
          <ion-label position="stacked">Límite mensual</ion-label>
          <ion-input
            type="number"
            [(ngModel)]="limit"
            placeholder="Ej: 500000"
          ></ion-input>
        </ion-item>
      </ion-list>

      <ion-button expand="block" (click)="save()" class="ion-margin-top">
        {{ mode === 'create' ? 'Crear' : 'Actualizar' }}
      </ion-button>

      <ion-button
        expand="block"
        fill="clear"
        color="danger"
        (click)="deleteBudget()"
        *ngIf="mode === 'edit'"
      >
        Eliminar presupuesto
      </ion-button>
    </ion-content>
  `,
  styles: [
    `
      .item-selected {
        --background: rgba(37, 99, 235, 0.08);
        --border-radius: 12px;
      }
    `,
  ],
})
export class BudgetModalComponent implements OnInit {
  @Input() categories: any[] = [];
  @Input() existingBudgets: any[] = [];
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() budgetToEdit: {
    id: string;
    categoryId: string;
    limit: number;
  } | null = null;

  selectedCategoryId: string = '';
  limit: number = 0;
  availableCategories: any[] = [];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    if (this.mode === 'edit' && this.budgetToEdit) {
      this.selectedCategoryId = this.budgetToEdit.categoryId;
      this.limit = this.budgetToEdit.limit;
    }

    const existingIds = this.existingBudgets.map((b) => b.categoryId);
    if (this.mode === 'create') {
      this.availableCategories = this.categories.filter(
        (c) => !existingIds.includes(c.id),
      );
    } else {
      this.availableCategories = this.categories.filter(
        (c) => !existingIds.includes(c.id) || c.id === this.selectedCategoryId,
      );
    }
  }

  selectCategory(categoryId: string) {
    this.selectedCategoryId = categoryId;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    if (!this.selectedCategoryId) {
      alert('Selecciona una categoría');
      return;
    }
    if (!this.limit || this.limit <= 0) {
      alert('Ingresa un límite válido mayor a cero');
      return;
    }

    this.modalController.dismiss({
      budget: {
        categoryId: this.selectedCategoryId,
        limit: Number(this.limit),
      },
    });
  }

  deleteBudget() {
    this.modalController.dismiss({ delete: true });
  }
}
