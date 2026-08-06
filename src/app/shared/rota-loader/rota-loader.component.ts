import { Component, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationSkipped, NavigationStart, Router } from '@angular/router';

// Só mostra o loader se a navegação levar mais que isso — evita o "flash" da animação
// em trocas de rota que carregam quase instantâneas (chunk já em cache do navegador).
const ATRASO_ANTES_DE_MOSTRAR_MS = 150;

/**
 * Loader global de troca de rota (added 2026-08-05) — toda rota é lazy (`loadComponent`
 * em app.routes.ts), então o clique num link da sidebar podia parecer "não fez nada"
 * enquanto o chunk da próxima página ainda está baixando/parseando, sem nenhum feedback
 * visual nesse meio-tempo. Escuta os eventos do Router diretamente (não precisa de guard
 * nem de estado em cada página) — mostra em NavigationStart, esconde em qualquer evento
 * de conclusão (sucesso, cancelamento, erro ou "pulada" por já estar na mesma URL).
 */
@Component({
  selector: 'app-rota-loader',
  imports: [],
  styles: [':host { display: contents; }'],
  template: `
    @if (carregando()) {
      <div class="fixed inset-0 z-[130] flex items-center justify-center" style="background-color: rgba(0,0,0,0.15);">
        <div class="loader-rota"></div>
      </div>
    }
  `,
})
export class RotaLoaderComponent {
  private router = inject(Router);
  carregando = signal(false);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.router.events.subscribe(evento => {
      if (evento instanceof NavigationStart) {
        this.timeoutId = setTimeout(() => this.carregando.set(true), ATRASO_ANTES_DE_MOSTRAR_MS);
        return;
      }
      if (
        evento instanceof NavigationEnd ||
        evento instanceof NavigationCancel ||
        evento instanceof NavigationError ||
        evento instanceof NavigationSkipped
      ) {
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
        this.carregando.set(false);
      }
    });
  }
}
