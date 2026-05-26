/**
 * Modelo de transacción para representar las transacciones de ingresos y gastos en la aplicación.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    categoryId: string;
    description: string;
    date: Date;
    createdAt: string;
    updatedAt: string;
}
