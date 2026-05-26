import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Category } from '../models/category';

@Injectable({ providedIn: 'root' })

/**
 * Servicio para manejar las categorías de ingresos y gastos.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
export class CategoryService {
    private readonly CATEGORIES_KEY = 'categories';

    constructor(private storage: StorageService) { }

    //** Obtiene todas las categorías de un usuario **///
    async getCategories(userId: string): Promise<Category[]> {
        const all = await this.storage.get(this.CATEGORIES_KEY) || [];
        return all.filter((c: Category) => c.userId === userId);
    }

    //** Obtiene una categoría por su ID **///
    async getCategoryById(id: string, userId: string): Promise<Category | null> {
        const all = await this.storage.get(userId) || [];
        return all.find((c: Category) => c.id === id) || null;
    }

    //** Agrega una nueva categoría **///
    async addCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
        const newCategory: Category = {
            ...category,
            id: crypto.randomUUID(),
            createdAt: new Date()
        };
        const all = await this.storage.get(this.CATEGORIES_KEY) || [];
        all.push(newCategory);
        await this.storage.set(this.CATEGORIES_KEY, all);
        return newCategory;
    }

    //** Actualiza una categoría por su ID **///
    async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
        const all = await this.storage.get(this.CATEGORIES_KEY) || [];
        const index = all.findIndex((c: Category) => c.id === id);
        if (index !== -1) {
            all[index] = { ...all[index], ...updates };
            await this.storage.set(this.CATEGORIES_KEY, all);
        }
    }

    //** Elimina una categoría por su ID **///
    async deleteCategory(id: string): Promise<void> {
        const all = await this.storage.get(this.CATEGORIES_KEY) || [];
        const filtered = all.filter((c: Category) => c.id !== id);
        await this.storage.set(this.CATEGORIES_KEY, filtered);
    }

    // Categorías por defecto para un nuevo usuario
    async createDefaultCategories(userId: string): Promise<void> {
        const defaults: Omit<Category, 'id' | 'createdAt'>[] = [
            { name: 'Salario', icon: 'cash-outline', color: '#10B981', type: 'income', userId, isDefault: true },
            { name: 'Supermercado', icon: 'cart-outline', color: '#EF4444', type: 'expense', userId, isDefault: true },
            { name: 'Transporte', icon: 'bus-outline', color: '#F59E0B', type: 'expense', userId, isDefault: true },
            { name: 'Entretenimiento', icon: 'tv-outline', color: '#8B5CF6', type: 'expense', userId, isDefault: true },
            { name: 'Salud', icon: 'medkit-outline', color: '#EC4899', type: 'expense', userId, isDefault: true },
            { name: 'Educación', icon: 'school-outline', color: '#06B6D4', type: 'expense', userId, isDefault: true },
        ];
        for (const cat of defaults) {
            await this.addCategory(cat);
        }
    }

}