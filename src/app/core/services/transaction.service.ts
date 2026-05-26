import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Transaction } from '../models/transaction';

/**
 * Servicio para gestionar las transacciones de ingresos y gastos en la aplicación.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
@Injectable({ providedIn: 'root' })
export class TransactionService {
    private readonly TRANSACTIONS_KEY = 'transactions';

    constructor(private storage: StorageService) { }

    //** Obtiene todas las transacciones de un usuario **///
    async getAllTransactions(): Promise<Transaction[]> {
        return await this.storage.get(this.TRANSACTIONS_KEY) || [];
    }

    //** Obtiene las transacciones de un usuario por su ID **///
    async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
        const all = await this.getAllTransactions();
        return all.filter(t => t.userId === userId);
    }

    //** Agrega una nueva transacción **///
    async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
        const newTransaction: Transaction = {
            ...transaction,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const all = await this.getAllTransactions();
        all.push(newTransaction);
        await this.storage.set(this.TRANSACTIONS_KEY, all);
        return newTransaction;
    }

    //** Actualiza una transacción por su ID **///
    async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
        const all = await this.getAllTransactions();
        const index = all.findIndex(t => t.id === id);
        if (index !== -1) {
            all[index] = { ...all[index], ...updates, updatedAt: new Date() };
            await this.storage.set(this.TRANSACTIONS_KEY, all);
        }
    }

    //** Elimina una transacción por su ID **///
    async deleteTransaction(id: string): Promise<void> {
        const all = await this.getAllTransactions();
        const filtered = all.filter(t => t.id !== id);
        await this.storage.set(this.TRANSACTIONS_KEY, filtered);
    }
}