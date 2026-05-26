import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/**
 * Servicio para manejar el almacenamiento local utilizando Ionic Storage.
 * Proporciona métodos para guardar, obtener y eliminar datos de forma asíncrona.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private _storage: Storage | null = null;

  constructor() { }

  //** Inicializa el almacenamiento */
  async init() {
    if (!this._storage) {
      const storage = new Storage({ name: 'my_finance_db' });
      this._storage = await storage.create();
    }
    return this._storage;
  }

  //** Obtiene un valor del almacenamiento */
  async get(key: string): Promise<any> {
    await this.init();
    return this._storage?.get(key);
  }

  //** Establece un valor en el almacenamiento */
  async set(key: string, value: any): Promise<void> {
    await this.init();
    await this._storage?.set(key, value);
  }

  //** Elimina un valor del almacenamiento */
  async remove(key: string): Promise<void> {
    await this.init();
    await this._storage?.remove(key);
  }

  //** Limpia el almacenamiento */
  async clear(): Promise<void> {
    await this.init();
    await this._storage?.clear();
  }
}