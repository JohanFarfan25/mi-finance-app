import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

/**
 * SERVICIO DE INSPECCIÓN DE SHADOW DOM
 * Analiza la estructura del Shadow DOM en Ionic para detectar bloqueos de eventos.
 * 
 * ADVERTENCIA: Esto es SOLO para debugging en fase de diagnóstico.
 */
@Injectable({
  providedIn: 'root',
})
export class ShadowDomInspectorService {
  private isNative = false;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Inspecciona completamente la estructura del DOM/Shadow DOM.
   * Busca elementos que puedan estar bloqueando eventos.
   */
  inspectDOM(): void {
    if (!this.isNative) {
      console.log('[SHADOW-DOM] No es plataforma nativa, saltando inspección');
      return;
    }

    console.log('\n================== INSPECCIÓN SHADOW DOM ==================\n');

    // 1. Revisar ion-app
    const ionApp = document.querySelector('ion-app');
    console.log('[SHADOW-DOM] ion-app:', ionApp);
    this.inspectElement(ionApp, 'ion-app', 0);

    // 2. Revisar ion-menu
    const ionMenu = document.querySelector('ion-menu');
    console.log('[SHADOW-DOM] ion-menu:', ionMenu);
    if (ionMenu) {
      console.log('[SHADOW-DOM] ion-menu está presente en el DOM');
      this.inspectElement(ionMenu, 'ion-menu', 0);
    }

    // 3. Revisar overlay backdrop (visible o no)
    const backdrops = document.querySelectorAll('ion-backdrop');
    console.log('[SHADOW-DOM] ion-backdrops encontrados:', backdrops.length);
    backdrops.forEach((backdrop, idx) => {
      console.log(`[SHADOW-DOM] Backdrop #${idx}:`, {
        visible: (backdrop as any).style.display !== 'none',
        zIndex: (backdrop as any).style.zIndex,
        pointerEvents: (backdrop as any).style.pointerEvents,
      });
    });

    // 4. Revisar modales invisibles
    const modals = document.querySelectorAll('ion-modal');
    console.log('[SHADOW-DOM] ion-modals encontrados:', modals.length);
    modals.forEach((modal, idx) => {
      const isHidden = (modal as any).style.display === 'none' || (modal as any).getAttribute('aria-hidden') === 'true';
      console.log(`[SHADOW-DOM] Modal #${idx}:`, {
        hidden: isHidden,
        zIndex: (modal as any).style.zIndex,
      });
    });

    // 5. Revisar ion-content
    const ionContents = document.querySelectorAll('ion-content');
    console.log('[SHADOW-DOM] ion-contents encontrados:', ionContents.length);
    ionContents.forEach((content, idx) => {
      console.log(`[SHADOW-DOM] Content #${idx}:`, {
        scrollX: (content as any).scrollX,
        scrollY: (content as any).scrollY,
      });
    });

    // 6. Buscar elementos con z-index alto que puedan estar cubriendo botones
    this.findElementsWithHighZIndex();

    // 7. Revisar listeners de eventos en el documento
    this.analyzeEventListeners();

    console.log('\n================== FIN INSPECCIÓN ==================\n');
  }

  private inspectElement(el: Element | null, name: string, depth: number): void {
    if (!el) return;

    const indent = '  '.repeat(depth);

    // Revisar si tiene Shadow DOM
    const shadowRoot = (el as any).shadowRoot;
    if (shadowRoot) {
      console.log(`${indent}[SHADOW-DOM] ${name} tiene shadowRoot`);
      const children = shadowRoot.children;
      console.log(`${indent}  - children en shadowRoot: ${children.length}`);

      // Listar primeros hijos del shadow root
      for (let i = 0; i < Math.min(children.length, 5); i++) {
        const child = children[i] as HTMLElement;
        console.log(`${indent}    [${i}] ${child.tagName}${child.id ? '#' + child.id : ''}${child.className ? '.' + child.className.split(' ').join('.') : ''}`);
      }
    }

    // Revisar atributos sospechosos
    const style = window.getComputedStyle(el);
    console.log(`${indent}Computed style:`, {
      display: style.display,
      visibility: style.visibility,
      pointerEvents: style.pointerEvents,
      zIndex: style.zIndex,
      position: style.position,
    });
  }

  private findElementsWithHighZIndex(): void {
    const allElements = document.querySelectorAll('*');
    const highZIndexElements: Array<{ el: Element; zIndex: number }> = [];

    allElements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const zIndex = style.zIndex;
      if (zIndex !== 'auto' && parseInt(zIndex) > 1000) {
        highZIndexElements.push({
          el,
          zIndex: parseInt(zIndex),
        });
      }
    });

    if (highZIndexElements.length > 0) {
      console.log('[SHADOW-DOM] Elementos con z-index > 1000:');
      highZIndexElements.sort((a, b) => b.zIndex - a.zIndex);
      highZIndexElements.forEach((item) => {
        const el = item.el as HTMLElement;
        console.log(`  - z-index: ${item.zIndex}, element: ${el.tagName}${el.id ? '#' + el.id : ''}`);
      });
    }
  }

  private analyzeEventListeners(): void {
    console.log('[SHADOW-DOM] Analizando listeners de eventos...');

    // Nota: Esto es limitado porque los listeners no son completamente accesibles desde JS
    // Pero podemos verificar si existen listeners de captura

    // Crear un evento dummy y ver si algo lo consume
    const testEvent = new MouseEvent('test', {
      bubbles: true,
      cancelable: true,
    });

    // Verificar en varias capas
    const layers = [
      { name: 'document', el: document },
      { name: 'body', el: document.body },
      { name: 'ion-app', el: document.querySelector('ion-app') },
    ];

    layers.forEach((layer) => {
      if (layer.el) {
        console.log(`[SHADOW-DOM] Listeners en ${layer.name}: (análisis limitado)`);
      }
    });
  }

  /**
   * Verifica si elementos específicos están bloqueando clics
   */
  checkElementClickability(selector: string): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) {
      console.log(`[SHADOW-DOM] Elemento no encontrado: ${selector}`);
      return;
    }

    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    console.log(`[SHADOW-DOM] Analizando clickability de: ${selector}`);
    console.log({
      pointerEvents: style.pointerEvents,
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      visible: rect.width > 0 && rect.height > 0,
    });

    // Verificar si hay elementos encima que lo cubren
    const topElement = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    console.log('[SHADOW-DOM] Elemento en la posición del click:', topElement?.tagName, (topElement as any)?.id);
  }
}
