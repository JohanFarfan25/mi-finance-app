import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Budget } from '../models/budget';

/**
 * Servicio para gestionar los presupuestos de categorías en la aplicación.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
@Injectable({ providedIn: 'root' })
export class BudgetService {
    private readonly BUDGETS_KEY = 'budgets';
    constructor(private storage: StorageService) { }

    //** Obtiene todos los presupuestos de un usuario **///
    async getAllBudgets(): Promise<Budget[]> {
        return (await this.storage.get(this.BUDGETS_KEY)) || [];
    }

    //** Obtiene los presupuestos de un usuario por su ID **///
    async getBudgetsByUser(userId: string): Promise<Budget[]> {
        const all = await this.getAllBudgets();
        return all.filter(b => b.userId === userId);
    }

    //** Obtiene los presupuestos de un usuario por su mes y año **///
    async getBudgetsByMonth(userId: string, month: number, year: number): Promise<Budget[]> {
        const all = await this.getBudgetsByUser(userId);
        return all.filter(b => b.month === month && b.year === year);
    }

    //** Agrega un nuevo presupuesto **///
    async addBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
        const newBudget: Budget = { ...budget, id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date() };
        const all = await this.getAllBudgets();
        all.push(newBudget);
        await this.storage.set(this.BUDGETS_KEY, all);
        return newBudget;
    }

    //** Actualiza un presupuesto por su ID **///
    async updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
        const all = await this.getAllBudgets();
        const index = all.findIndex(b => b.id === id);
        if (index !== -1) {
            all[index] = { ...all[index], ...updates, updatedAt: new Date() };
            await this.storage.set(this.BUDGETS_KEY, all);
        }
    }

    //** Elimina un presupuesto por su ID **///
    async deleteBudget(id: string): Promise<void> {
        const all = await this.getAllBudgets();
        const filtered = all.filter(b => b.id !== id);
        await this.storage.set(this.BUDGETS_KEY, filtered);
    }
}