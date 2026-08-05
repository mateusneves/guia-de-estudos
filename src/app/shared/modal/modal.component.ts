import { Component, EventEmitter, Input, Output } from '@angular/core';

// Shell genérico de modal (backdrop + card centralizado + título + botão fechar) —
// o conteúdo é sempre projetado via <ng-content>, então qualquer feature nova que
// precise de um modal só precisa envolver seu próprio formulário/conteúdo nele, sem
// duplicar backdrop/posicionamento/botão-fechar (mesmo motivo de app-atividade-card
// existir: uma peça de apresentação compartilhada em vez de markup repetido por página).
@Component({
  selector: 'app-modal',
  imports: [],
  styles: [':host { display: contents; }'],
  template: `
    @if (aberto) {
      <div
        class="fixed inset-0 z-[110] flex items-center justify-center p-4"
        style="background-color: rgba(0,0,0,0.6);"
        (click)="fechar.emit()"
      >
        <div class="card w-full max-w-md max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between gap-3 mb-4">
            <h3 class="font-semibold text-[var(--cor-texto-principal)]">{{ titulo }}</h3>
            <button
              type="button"
              (click)="fechar.emit()"
              class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[var(--cor-texto-secundario)] transition-colors hover:bg-[var(--cor-fundo-sutil)]"
              aria-label="Fechar"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <ng-content></ng-content>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() aberto = false;
  @Input() titulo = '';
  @Output() fechar = new EventEmitter<void>();
}
