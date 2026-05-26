/**
 * Modelo de categoría para representar las categorías de ingresos y gastos en la aplicación.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
    isDefault: boolean;
    userId: string;
    createdAt: Date;
}
