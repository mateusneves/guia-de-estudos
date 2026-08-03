import { Component, inject, signal } from '@angular/core';
import { QuizDiarioService, XP_QUESTIONARIO_DIARIO } from '../../services/quiz-diario.service';

type EstadoLocal = 'pendente' | 'incorreto' | 'correto' | 'esgotado';

@Component({
  selector: 'app-quiz-diario-modal',
  imports: [],
  template: `
    @if (quiz.modalAberto()) {
      <div class="fixed inset-0 z-[110] flex items-center justify-center p-4" style="background-color: rgba(0,0,0,0.6);">
        @if (quiz.perguntaHoje(); as q) {
          <div class="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-wide text-[var(--cor-texto-terciario)]">Questionário Diário</p>
                <p class="text-xs text-[var(--cor-texto-secundario)] mt-0.5 truncate">{{ q.capitulo }}</p>
              </div>
              <button
                type="button"
                (click)="quiz.fecharModal()"
                class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[var(--cor-texto-secundario)] transition-colors hover:bg-[var(--cor-fundo-sutil)]"
                aria-label="Fechar"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <p
              class="text-lg font-semibold text-[var(--cor-texto-principal)] mb-3 leading-snug"
              style="font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif;"
            >{{ q.pergunta }}</p>

            <div class="mb-4 px-3 py-2 rounded-lg flex items-center gap-2" style="background-color: var(--cor-fundo-sutil);">
              <i class="fa-solid fa-bolt text-xs" style="color: var(--cor-secundaria);"></i>
              <p class="text-xs text-[var(--cor-texto-secundario)]">Resposta correta vale <strong class="text-[var(--cor-texto-principal)]">+{{ xp }} XP</strong></p>
            </div>

            <div class="space-y-2">
              @for (alt of q.alternativas; track alt) {
                <button
                  type="button"
                  (click)="selecionar(alt)"
                  [disabled]="resultado() === 'correto' || resultado() === 'esgotado'"
                  class="w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors disabled:cursor-default"
                  [style.background-color]="corFundo(alt)"
                  [style.border-color]="corBorda(alt)"
                  [style.color]="'var(--cor-texto-principal)'"
                >{{ alt }}</button>
              }
            </div>

            @if (resultado() === 'incorreto') {
              <p class="text-sm text-rose-500 mt-3 font-medium">Resposta incorreta. Você ainda tem mais uma tentativa!</p>
            }

            @if (resultado() === 'correto') {
              <div class="mt-4 p-3 rounded-lg" style="background-color: var(--cor-sucesso-fundo);">
                <p class="text-sm font-semibold text-green-700">Resposta correta! +{{ xp }} XP</p>
                <p class="text-xs text-[var(--cor-texto-secundario)] mt-1">{{ q.explicacao }}</p>
              </div>
            }

            @if (resultado() === 'esgotado') {
              <div class="mt-4 p-3 rounded-lg" style="background-color: var(--cor-fundo-sutil);">
                <p class="text-sm font-semibold text-[var(--cor-texto-principal)]">Não foi dessa vez.</p>
                <p class="text-xs text-[var(--cor-texto-secundario)] mt-1">Resposta correta: <strong>{{ q.respostaCorreta }}</strong></p>
                <p class="text-xs text-[var(--cor-texto-secundario)] mt-1">{{ q.explicacao }}</p>
              </div>
            }

            @if (resultado() === 'correto' || resultado() === 'esgotado') {
              <button
                type="button"
                (click)="quiz.fecharModal()"
                class="mt-4 w-full px-4 py-2.5 rounded-full text-sm font-medium text-white transition-colors"
                style="background-color: var(--cor-primaria);"
              >Fechar</button>
            } @else {
              <button
                type="button"
                (click)="confirmar()"
                [disabled]="!selecionada() || confirmando()"
                class="mt-4 w-full px-4 py-2.5 rounded-full text-sm font-medium text-white transition-colors disabled:opacity-40"
                style="background-color: var(--cor-primaria);"
              >{{ confirmando() ? 'Confirmando...' : 'Confirmar resposta' }}</button>
              <button
                type="button"
                (click)="quiz.fecharModal()"
                class="mt-2 w-full px-4 py-2 rounded-full text-xs font-medium text-[var(--cor-texto-secundario)] transition-colors hover:bg-[var(--cor-fundo-sutil)]"
              >Responder depois</button>
            }
          </div>
        }
      </div>
    }
  `,
})
export class QuizDiarioModalComponent {
  quiz = inject(QuizDiarioService);
  xp = XP_QUESTIONARIO_DIARIO;

  selecionada = signal<string | null>(null);
  resultado = signal<EstadoLocal>('pendente');
  confirmando = signal(false);

  /** Só marca a escolha — não envia nada ainda, precisa confirmar. Reabrir a seleção
   * depois de uma resposta incorreta (ainda há tentativa) limpa o feedback anterior. */
  selecionar(alt: string): void {
    if (this.resultado() === 'correto' || this.resultado() === 'esgotado') return;
    this.selecionada.set(alt);
    if (this.resultado() === 'incorreto') {
      this.resultado.set('pendente');
    }
  }

  async confirmar(): Promise<void> {
    const alt = this.selecionada();
    if (!alt || this.confirmando()) return;
    this.confirmando.set(true);
    try {
      const r = await this.quiz.responder(alt);
      this.resultado.set(r);
    } finally {
      this.confirmando.set(false);
    }
  }

  corFundo(alt: string): string {
    const correta = this.quiz.perguntaHoje()?.respostaCorreta;
    const r = this.resultado();
    if (r === 'correto' && alt === correta) return 'var(--cor-sucesso-fundo)';
    if (r === 'esgotado') {
      if (alt === correta) return 'var(--cor-sucesso-fundo)';
      if (alt === this.selecionada()) return '#fef2f2';
    }
    if (r === 'incorreto' && alt === this.selecionada()) return '#fef2f2';
    if (r === 'pendente' && alt === this.selecionada()) return 'var(--cor-fundo-sutil-forte)';
    return 'var(--cor-fundo-sutil)';
  }

  corBorda(alt: string): string {
    const correta = this.quiz.perguntaHoje()?.respostaCorreta;
    const r = this.resultado();
    if (r === 'correto' && alt === correta) return 'var(--cor-sucesso-borda)';
    if (r === 'esgotado') {
      if (alt === correta) return 'var(--cor-sucesso-borda)';
      if (alt === this.selecionada()) return '#fca5a5';
    }
    if (r === 'incorreto' && alt === this.selecionada()) return '#fca5a5';
    if (r === 'pendente' && alt === this.selecionada()) return 'var(--cor-primaria)';
    return 'var(--cor-borda-sutil)';
  }
}
