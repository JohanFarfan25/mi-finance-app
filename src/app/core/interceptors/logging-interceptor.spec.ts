import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';

import { loggingInterceptor } from './logging-interceptor';

/**
 * Prueba del interceptor de logging.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
describe('loggingInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => loggingInterceptor(req, next));

  /**
   * Configuración del módulo de pruebas.
   */
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  /**
   * Prueba que el interceptor se haya creado correctamente.
   */
  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
