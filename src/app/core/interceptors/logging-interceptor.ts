import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor que registra las peticiones HTTP realizadas en la aplicación.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
