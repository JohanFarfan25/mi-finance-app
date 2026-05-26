import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Módulo central de la aplicación que agrupa servicios, modelos y guardias comunes.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule ya está cargado. Impórtalo solo en AppModule.',
      );
    }
  }
}
