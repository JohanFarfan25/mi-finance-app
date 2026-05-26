import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Category } from '../../../../core/models/category';

@Component({
  selector: 'app-category-form-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './category-form-modal.component.html',
  styleUrls: ['./category-form-modal.component.scss'],
})
export class CategoryFormModalComponent implements OnInit {
  @Input() category?: Category;
  @Input() isEdit = false;

  categoryData = {
    name: '',
    icon: 'pricetag-outline',
    color: '#3B82F6',
    type: 'expense' as 'income' | 'expense'
  };

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    if (this.category) {
      this.categoryData = { ...this.category };
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    if (!this.categoryData.name) return;
    this.modalCtrl.dismiss(this.categoryData);
  }
}