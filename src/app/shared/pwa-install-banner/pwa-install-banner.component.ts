import { Component, inject } from '@angular/core';
import { PwaInstallService } from '../../services/pwa-install.service';

@Component({
  selector: 'app-pwa-install-banner',
  imports: [],
  // Sem isso o host fica display:inline (padrão de elemento customizado) e não
  // participa corretamente do flex column onde é inserido em app.ts.
  styles: [':host { display: block; }'],
  template: `
    @if (pwa.mostrarAviso()) {
      <div
        class="mx-4 md:mx-0 shrink-0 rounded-2xl px-4 py-3 flex items-center gap-3 text-sm text-white"
        style="background-color: var(--cor-primaria);"
      >
        <i class="fa-solid fa-mobile-screen-button text-lg shrink-0"></i>
        <p class="flex-1 min-w-0 leading-snug">
          @if (pwa.plataforma === 'ios') {
            Instale o Guia de Estudos no seu celular: toque em <i class="fa-solid fa-arrow-up-from-bracket"></i> e depois em "Adicionar à Tela de Início".
          } @else {
            Instale o Guia de Estudos no seu celular para acessar mais rápido, como um app.
          }
        </p>
        @if (pwa.plataforma === 'android') {
          <button
            type="button"
            (click)="pwa.instalar()"
            class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-white"
            style="color: var(--cor-primaria);"
          >Instalar</button>
        }
        <button
          type="button"
          (click)="pwa.dispensar()"
          class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label="Fechar aviso"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    }
  `,
})
export class PwaInstallBannerComponent {
  pwa = inject(PwaInstallService);
}
