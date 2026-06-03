import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonAccordionGroup,
  IonAccordion
} from '@ionic/angular/standalone';
import { Category } from '../../../../core/models/category';

@Component({
  selector: 'app-category-form-modal',
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
    IonItem,
    IonLabel,
    IonIcon,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonAccordionGroup,
    IonAccordion,
  ],
  templateUrl: './category-form-modal.component.html',
  styleUrls: ['./category-form-modal.component.scss'],
})
export class CategoryFormModalComponent implements OnInit {
  @Input() category?: Category;
  @Input() isEdit = false;
  showIconSelector = false;
  showColorSelector = false;

  categoryData = {
    name: '',
    icon: 'pricetag-outline',
    color: '#3B82F6',
    type: 'expense' as 'income' | 'expense',
  };

  iconGroups = [
    {
      title: 'Finanzas',
      icons: [
        'wallet-outline',
        'cash-outline',
        'receipt-outline',
        'pricetag-outline',
        'pricetags-outline',
        'calculator-outline',
        'stats-chart-outline'
      ]
    },

    {
      title: 'Compras',
      icons: [
        'cart-outline',
        'basket-outline',
        'bag-outline',
        'bag-handle-outline',
        'storefront-outline',
        'ticket-outline'
      ]
    },

    {
      title: 'Hogar',
      icons: [
        'home-outline',
        'bed-outline',
        'construct-outline',
        'hammer-outline',
        'bulb-outline'
      ]
    },

    {
      title: 'Transporte',
      icons: [
        'car-outline',
        'car-sport-outline',
        'bus-outline',
        'subway-outline',
        'train-outline',
        'boat-outline',
        'bicycle-outline',
        'airplane-outline'
      ]
    },

    {
      title: 'Alimentación',
      icons: [
        'restaurant-outline',
        'cafe-outline',
        'pizza-outline',
        'wine-outline',
        'ice-cream-outline',
        'fast-food-outline'
      ]
    },

    {
      title: 'Salud',
      icons: [
        'medkit-outline',
        'heart-outline',
        'pulse-outline',
        'bandage-outline',
        'fitness-outline'
      ]
    },

    {
      title: 'Educación',
      icons: [
        'school-outline',
        'book-outline',
        'library-outline',
        'reader-outline',
        'journal-outline'
      ]
    },

    {
      title: 'Tecnología',
      icons: [
        'laptop-outline',
        'desktop-outline',
        'phone-portrait-outline',
        'phone-landscape-outline',
        'hardware-chip-outline',
        'wifi-outline'
      ]
    },

    {
      title: 'Entretenimiento',
      icons: [
        'game-controller-outline',
        'musical-note-outline',
        'musical-notes-outline',
        'tv-outline',
        'camera-outline',
        'videocam-outline',
        'film-outline',
        'image-outline'
      ]
    },

    {
      title: 'Trabajo',
      icons: [
        'briefcase-outline',
        'business-outline',
        'clipboard-outline'
      ]
    },

    {
      title: 'Servicios',
      icons: [
        'flash-outline',
        'water-outline',
        'wifi-outline'
      ]
    },

    {
      title: 'Mascotas',
      icons: [
        'paw-outline',
        'heart-outline'
      ]
    },

    {
      title: 'Regalos',
      icons: [
        'gift-outline',
        'star-outline',
        'archive-outline',
        'ribbon-outline'
      ]
    },

    {
      title: 'Familia',
      icons: [
        'people-outline',
        'people-circle-outline',
        'person-outline',
        'person-add-outline',
        'person-remove-outline'
      ]
    },

    {
      title: 'Viajes',
      icons: [
        'map-outline',
        'navigate-outline',
        'location-outline',
        'compass-outline',
        'airplane-outline'
      ]
    },

    {
      title: 'Ahorro',
      icons: [
        'bookmark-outline',
        'save-outline',
        'wallet-outline',
        'cash-outline'
      ]
    },

    {
      title: 'Otros',
      icons: [
        'refresh-outline',
        'reload-outline',
        'infinite-outline'
      ]
    }
  ];

  colorGroups = [
    {
      title: '🔵 Azules',
      colors: [
        '#DBEAFE',
        '#BFDBFE',
        '#93C5FD',
        '#60A5FA',
        '#3B82F6',
        '#2563EB',
        '#1D4ED8',
        '#1E40AF'
      ]
    },
    {
      title: '🟢 Verdes',
      colors: [
        '#DCFCE7',
        '#BBF7D0',
        '#86EFAC',
        '#4ADE80',
        '#22C55E',
        '#16A34A',
        '#15803D',
        '#166534'
      ]
    },
    {
      title: '🔴 Rojos',
      colors: [
        '#FEE2E2',
        '#FECACA',
        '#FCA5A5',
        '#F87171',
        '#EF4444',
        '#DC2626',
        '#B91C1C',
        '#991B1B'
      ]
    },
    {
      title: '🟣 Morados',
      colors: [
        '#F3E8FF',
        '#E9D5FF',
        '#D8B4FE',
        '#C084FC',
        '#A855F7',
        '#9333EA',
        '#7E22CE',
        '#6B21A8'
      ]
    },
    {
      title: '🟡 Amarillos',
      colors: [
        '#FEF9C3',
        '#FEF08A',
        '#FDE047',
        '#FACC15',
        '#EAB308',
        '#CA8A04',
        '#A16207',
        '#854D0E'
      ]
    },
    {
      title: '🟠 Naranjas',
      colors: [
        '#FFEDD5',
        '#FED7AA',
        '#FDBA74',
        '#FB923C',
        '#F97316',
        '#EA580C',
        '#C2410C',
        '#9A3412'
      ]
    },
    {
      title: '🌈 Especiales',
      colors: [
        '#06B6D4',
        '#14B8A6',
        '#EC4899',
        '#E11D48',
        '#84CC16',
        '#6366F1',
        '#64748B',
        '#0F172A'
      ]
    }
  ];


  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    if (this.category) {
      this.categoryData = { ...this.category };
    }
  }

  selectIcon(icon: string) {
    this.categoryData.icon = icon;
    this.showIconSelector = false;
  }

  selectColor(color: string) {
    this.categoryData.color = color;
    this.showColorSelector = false;
  }

  toggleIconSelector() {
    this.showIconSelector = !this.showIconSelector;
  }

  toggleColorSelector() {
    this.showColorSelector = !this.showColorSelector;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    if (!this.categoryData.name) return;
    this.modalCtrl.dismiss(this.categoryData);
  }
}
