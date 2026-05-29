import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  AlertController,
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  IonButtons,
  IonFab,
  IonFabButton,
  IonFooter,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { CategoryService } from '../../../../core/services/category.service';
import { TransactionService } from '../../../../core/services/transaction.service';
import { AuthService } from '../../../auth/auth.service';
import { DiagnosticService } from '../../../../core/utils/diagnostic.service';
import { ShadowDomInspectorService } from '../../../../core/utils/shadow-dom-inspector.service';
import { User } from '../../../../core/models/user';
import { CategoryFormModalComponent } from '../../components/category-form-modal/category-form-modal.component';
import { getOverlayPresentingElement } from '../../../../core/utils/overlay.util';

interface CategoryDisplay {
  id: string;
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
  transactionCount: number;
  totalAmount: number;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonButton,
    IonButtons,
    IonFab,
    IonFabButton,
    IonFooter,
    IonMenuButton,
  ],
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {
  categories: CategoryDisplay[] = [];
  currentUser: User | null = null;
  currencyCode = 'COP';

  constructor(
    private categoryService: CategoryService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private router: Router,
    private diagnostic: DiagnosticService,
    private shadowDomInspector: ShadowDomInspectorService,
  ) {}

  async ngOnInit() {
    this.shadowDomInspector.inspectDOM();
    this.currentUser = await this.authService.getCurrentUser();
    if (this.currentUser) {
      this.currencyCode = this.currentUser.currency;
      await this.loadData();
    }
  }

  async loadData() {
    if (!this.currentUser) return;
    const transactions = await this.transactionService.getTransactionsByUserId(
      this.currentUser.id,
    );
    let categories = await this.categoryService.getCategories(
      this.currentUser.id,
    );
    if (categories.length === 0) {
      await this.categoryService.createDefaultCategories(this.currentUser.id);
      categories = await this.categoryService.getCategories(
        this.currentUser.id,
      );
    }
    this.categories = categories.map((cat) => {
      const related = transactions.filter((tx) => tx.categoryId === cat.id);
      const total = related.reduce((sum, tx) => sum + tx.amount, 0);
      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        backgroundColor: this.hexToRgba(cat.color, 0.15),
        transactionCount: related.length,
        totalAmount: total,
      };
    });
  }

  hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  async createCategory() {
    try {
      const presentingElement = getOverlayPresentingElement();
      const createPromise = this.modalCtrl.create({
        component: CategoryFormModalComponent,
        canDismiss: true,
        showBackdrop: true,
        backdropDismiss: true,
        presentingElement: presentingElement ?? undefined,
      });
      createPromise
        .then((modal) =>
          this.diagnostic.logToConsole(
            '[MODAL] create promise resolved',
            modal,
          ),
        )
        .catch((error) => {
          this.diagnostic.logToConsole(
            '[MODAL] create promise rejected',
            error,
          );
        });
      const modal = await createPromise;
      this.diagnostic.logToConsole('[MODAL] modalCtrl.create() completado');

      modal
        .onDidDismiss()
        .then(async (result) => {
          this.diagnostic.logToConsole(
            '[MODAL] onDidDismiss ejecutado',
            result,
          );

          if (result.data && this.currentUser) {
            const newCat = {
              ...result.data,
              userId: this.currentUser.id,
              isDefault: false,
            };
            await this.categoryService.addCategory(newCat);
            await this.loadData();
          } else {
            this.diagnostic.logToConsole(
              '[MODAL] onDidDismiss sin data, operación cancelada',
            );
          }
        })
        .catch((error) => {
          throw error;
        });

      await modal.present();
    } catch (error) {
      throw error;
    }
  }

  async editCategory(cat: CategoryDisplay) {
    try {
      const original = await this.categoryService.getCategoryById(
        cat.id,
        this.currentUser!.id,
      );

      if (!original) {
        this.diagnostic.logToConsole('[EDIT] Categoría no encontrada');
        return;
      }

      const presentingElement = getOverlayPresentingElement();
      const createPromise = this.modalCtrl.create({
        component: CategoryFormModalComponent,
        componentProps: { category: { ...original }, isEdit: true },
        canDismiss: true,
        showBackdrop: true,
        backdropDismiss: true,
        presentingElement: presentingElement ?? undefined,
      });
      createPromise
        .then((modal) =>
          this.diagnostic.logToConsole(
            '[MODAL] edit create promise resolved',
            modal,
          ),
        )
        .catch((error) => {
          this.diagnostic.logToConsole(
            '[MODAL] edit create promise rejected',
            error,
          );
          throw error;
        });
      const modal = await createPromise;

      modal
        .onDidDismiss()
        .then(async (result) => {
          if (result.data) {
            await this.categoryService.updateCategory(cat.id, result.data);

            await this.loadData();
          } else {
            this.diagnostic.logToConsole(
              '[EDIT] onDidDismiss sin data, operación cancelada',
            );
          }
        })
        .catch((error) => {
          throw error;
        });

      await modal.present();
    } catch (error) {
      throw error;
    }
  }

  async deleteCategory(id: string) {
    try {
      const alert = await this.alertCtrl.create({
        header: 'Confirmar',
        message:
          '¿Eliminar esta categoría? Las transacciones asociadas quedarán sin categoría.',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Eliminar',
            role: 'destructive',
            handler: () => {
              void this.categoryService
                .deleteCategory(id)
                .then(() => {
                  this.diagnostic.logToConsole(
                    '[DELETE] Categoría eliminada, recargando datos',
                  );
                  this.loadData();
                })
                .catch((error) => {
                  throw error;
                });
            },
          },
        ],
      });

      await alert.present();
    } catch (error) {
      throw error;
    }
  }

  viewCategory(cat: CategoryDisplay) {
    void this.router.navigateByUrl(`/category-detail?id=${cat.id}`);
  }

  openSearch() {
    alert('Búsqueda de categorías (próximamente)');
  }
}
