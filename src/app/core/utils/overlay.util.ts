/** Elemento raíz para presentar modales/alerts por encima de páginas en caché (Ionic stack). */
export function getOverlayPresentingElement(): HTMLElement | null {
  return (
    (document.querySelector('.ion-page:not(.ion-page-hidden)') as HTMLElement | null) ??
    (document.querySelector('#main-content') as HTMLElement | null) ??
    (document.querySelector('ion-router-outlet') as HTMLElement | null) ??
    (document.querySelector('ion-app') as HTMLElement | null)
  );
}
