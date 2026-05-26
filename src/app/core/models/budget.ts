/**
 * Modelo de presupuesto para representar los presupuestos de categorías en la aplicación.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
export interface Budget {
    id: string;
    userId: string;
    categoryId: string;
    month: number;
    year: number;
    limit: number;
    createdAt: Date;
    updatedAt: Date;
}