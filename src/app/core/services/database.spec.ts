import { TestBed } from '@angular/core/testing';

import { Database } from './database';

/**
 * Prueba del servicio de base de datos.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
describe('Database', () => {
  let service: Database;

  /**
   * Configuración del módulo de pruebas.
   */
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Database);
  });

  /**
   * Prueba que el servicio se haya creado correctamente.
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
