import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

/**
 * SERVICIO DE DIAGNÓSTICO TEMPORAL
 * Captura TODOS los eventos táctiles y click en Android para rastrear dónde se pierden.
 * 
 * ADVERTENCIA: Esto es SOLO para debugging en fase de diagnóstico.
 * DEBE ser removido después de identificar la causa raíz.
 */
@Injectable({
  providedIn: 'root',
})
export class DiagnosticService {
  private isNative = false;
  private eventLog: any[] = [];
  private maxLogSize = 500;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    if (this.isNative) {
      this.initializeGlobalListeners();
      this.logToConsole('DIAGNÓSTICO INICIADO EN PLATAFORMA NATIVA');
    }
  }

  private initializeGlobalListeners(): void {
    // LAYER 1: Capturar click en fase de CAPTURA (antes de que los listeners normales lo vean)
    document.addEventListener(
      'click',
      (e: Event) => this.handleClickCapture(e),
      true // true = fase de CAPTURA
    );

    // LAYER 2: Capturar click en fase de BURBUJA (después de que los listeners normales lo vean)
    document.addEventListener(
      'click',
      (e: Event) => this.handleClickBubble(e),
      false // false = fase de BURBUJA
    );

    // LAYER 3: Capturar touchstart
    document.addEventListener(
      'touchstart',
      (e: Event) => this.handleTouchStart(e),
      true
    );

    // LAYER 4: Capturar touchend
    document.addEventListener(
      'touchend',
      (e: Event) => this.handleTouchEnd(e),
      true
    );

    // LAYER 5: Capturar pointerdown
    document.addEventListener(
      'pointerdown',
      (e: Event) => this.handlePointerDown(e),
      true
    );

    // LAYER 6: Capturar pointerup
    document.addEventListener(
      'pointerup',
      (e: Event) => this.handlePointerUp(e),
      true
    );

    // LAYER 7: Monitorear cambios de defaultPrevented
    const originalPreventDefault = Event.prototype.preventDefault;
    Event.prototype.preventDefault = function () {
      const target = this.target as HTMLElement;
      const eventType = this.type;
      const targetInfo = `${target?.tagName || 'unknown'}${target?.id ? '#' + target.id : ''}${target?.className ? '.' + target.className.split(' ').join('.') : ''}`;
      console.warn(
        `[DIAGNÓSTICO] preventDefault() llamado en evento: ${eventType} en elemento: ${targetInfo}`
      );
      return originalPreventDefault.call(this);
    };
  }

  private handleClickCapture(e: Event): void {
    const target = e.target as HTMLElement;
    const info = {
      phase: 'CAPTURE',
      type: 'click',
      target: target?.tagName,
      id: target?.id,
      class: target?.className,
      innerHTML: target?.innerHTML?.substring(0, 50),
      timestamp: Date.now(),
      defaultPrevented: e.defaultPrevented,
      cancelable: e.cancelable,
      composed: (e as any).composed,
      path: (e as any).composedPath ? (e as any).composedPath().map((el: HTMLElement) => el.tagName).join(' > ') : 'N/A',
    };
    this.addLogEntry(info);
    console.log(`[DIAGNÓSTICO] CLICK CAPTURE:`, info);
  }

  private handleClickBubble(e: Event): void {
    const target = e.target as HTMLElement;
    const info = {
      phase: 'BUBBLE',
      type: 'click',
      target: target?.tagName,
      id: target?.id,
      defaultPrevented: e.defaultPrevented,
      cancelable: e.cancelable,
      timestamp: Date.now(),
    };
    this.addLogEntry(info);
    console.log(`[DIAGNÓSTICO] CLICK BUBBLE:`, info);
  }

  private handleTouchStart(e: Event): void {
    const touch = (e as TouchEvent).touches[0];
    const target = e.target as HTMLElement;
    const info = {
      phase: 'CAPTURE',
      type: 'touchstart',
      target: target?.tagName,
      id: target?.id,
      x: touch?.clientX,
      y: touch?.clientY,
      timestamp: Date.now(),
    };
    this.addLogEntry(info);
    console.log(`[DIAGNÓSTICO] TOUCHSTART:`, info);
  }

  private handleTouchEnd(e: Event): void {
    const target = e.target as HTMLElement;
    const info = {
      phase: 'CAPTURE',
      type: 'touchend',
      target: target?.tagName,
      id: target?.id,
      timestamp: Date.now(),
    };
    this.addLogEntry(info);
    console.log(`[DIAGNÓSTICO] TOUCHEND:`, info);
  }

  private handlePointerDown(e: Event): void {
    const target = e.target as HTMLElement;
    const info = {
      phase: 'CAPTURE',
      type: 'pointerdown',
      target: target?.tagName,
      id: target?.id,
      pointerId: (e as PointerEvent).pointerId,
      timestamp: Date.now(),
    };
    this.addLogEntry(info);
    console.log(`[DIAGNÓSTICO] POINTERDOWN:`, info);
  }

  private handlePointerUp(e: Event): void {
    const target = e.target as HTMLElement;
    const info = {
      phase: 'CAPTURE',
      type: 'pointerup',
      target: target?.tagName,
      id: target?.id,
      timestamp: Date.now(),
    };
    this.addLogEntry(info);
  }

  private addLogEntry(entry: any): void {
    if (this.eventLog.length >= this.maxLogSize) {
      this.eventLog.shift(); // Remover el más antiguo
    }
    this.eventLog.push(entry);
  }

  logToConsole(message: string, data?: any): void {
    if (this.isNative) {
      console.log(`[DIAGNÓSTICO-${Date.now()}] ${message}`, data || '');
    }
  }

  // Exportar logs para análisis
  exportLogs(): string {
    return JSON.stringify(this.eventLog, null, 2);
  }

  // Limpiar logs
  clearLogs(): void {
    this.eventLog = [];
  }

  // Obtener logs formateados
  getFormattedLogs(): string {
    return this.eventLog
      .map(
        (e) =>
          `[${new Date(e.timestamp).toISOString()}] ${e.type} (${e.phase}) -> ${e.target}${
            e.id ? '#' + e.id : ''
          }`
      )
      .join('\n');
  }
}
