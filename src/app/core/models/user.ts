/**
 * Modelo de usuario para representar la información del usuario en la aplicación.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
export interface User {
    id: string;
    fullName: string;
    email: string | null;
    currency: 'COP' | 'USD' | 'EUR';
    pinHash: string;
    createdAt: Date;
}
