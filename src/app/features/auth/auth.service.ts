import { Injectable } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { User } from '../../core/models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USER_KEY = 'currentUser';
  private readonly USERS_KEY = 'registeredUsers';

  constructor(private storage: StorageService) {}

  /**
   * Registra un nuevo usuario.
   * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
   */
  async register(
    userData: Omit<User, 'id' | 'pinHash' | 'createdAt'>,
    pin: string,
  ): Promise<User> {
    if (!pin || pin.length < 4)
      throw new Error('El PIN debe tener al menos 4 caracteres');

    const users = await this.getAllUsers();
    if (userData.email) {
      const existing = users.find((u) => u.email === userData.email);
      if (existing)
        throw new Error('Ya existe un usuario con ese correo electrónico');
    }

    const pinHash = await this.hashPin(pin);
    const newUser: User = {
      id: crypto.randomUUID(),
      fullName: userData.fullName,
      email: userData.email || null,
      currency: userData.currency,
      pinHash,
      createdAt: new Date(),
    };

    users.push(newUser);
    await this.storage.set(this.USERS_KEY, users);
    await this.storage.set(this.USER_KEY, newUser);
    return newUser;
  }

  /**
   * Inicia sesión del usuario.
   * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
   */
  async login(pin: string): Promise<boolean> {
    const users = await this.getAllUsers();
    if (users.length === 0) return false;
    const user = users[0];
    const isValid = await this.verifyPin(pin, user.pinHash);
    if (isValid) {
      await this.storage.set(this.USER_KEY, user);
      return true;
    }
    return false;
  }

  /**
   * Cierra sesión del usuario.
   * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
   */
  async logout(): Promise<void> {
    await this.storage.remove(this.USER_KEY);
  }

  /**
   * Verifica si el usuario está autenticado.
   * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.storage.get(this.USER_KEY);
    return !!user;
  }

  /**
   * Obtiene el usuario actual.
   * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
   */
  async getCurrentUser(): Promise<User | null> {
    return await this.storage.get(this.USER_KEY);
  }

  /**
   * Obtiene todos los usuarios registrados.
   * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
   */
  private async getAllUsers(): Promise<User[]> {
    const users = await this.storage.get(this.USERS_KEY);
    return users || [];
  }

  /**
   * Genera un hash del PIN.
   * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
   */
  private async hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifica si el PIN es correcto.
   * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
   */
  private async verifyPin(pin: string, hash: string): Promise<boolean> {
    const pinHash = await this.hashPin(pin);
    return pinHash === hash;
  }
}
