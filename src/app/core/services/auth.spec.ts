import { TestBed } from '@angular/core/testing';

import { Auth } from './auth';

/**
 * Prueba de servicio de autenticación.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
describe('Auth', () => {
  let service: Auth;

  /**
   * Configuración del módulo de pruebas.
   */
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Auth);
  });

  /**
   * Prueba que el servicio se haya creado correctamente.
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
