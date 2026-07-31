import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

export type UrgenciaAtividade = 'urgente' | 'em-breve' | 'normal';

// View-model puro — cada página monta o seu a partir da sua própria Avaliacao +
// lógica de urgência/rótulo/cor (que continua sendo dela, ver labelTipo/getCorTipo/
// isUrgente em cada componente). Este componente é só apresentação.
export interface AtividadeCardVm {
  titulo: string;
  descricaoSecundaria: string | null;
  concluida: boolean;
  tipo: string;
  tipoLabel: string;
  tipoCor: string;
  pontos: number;
  /** XP concedido ao concluir esta atividade — hoje um valor fixo (ver XP_POR_ATIVIDADE em gamificacao.service.ts), não algo específico da atividade em si, mas exibido por atividade a pedido do usuário. */
  xp: number;
  dataDisplay: string;
  diasRestantes: string | null;
  urgencia: UrgenciaAtividade;
  disciplinaId: string | null;
  disciplinaNome: string | null;
  disciplinaCor: string | null;
}

@Component({
  selector: 'app-atividade-card',
  imports: [RouterLink],
  // Sem isso o host fica com o display:inline padrão de elemento customizado — o
  // margin-top que o space-y-3 do container pai aplica a cada card não tem efeito
  // nenhum em um elemento inline, e os cards ficam colados uns nos outros.
  styles: [':host { display: block; }'],
  template: `
    <div
      class="atividade-card flex flex-col rounded-2xl border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-px"
      [class.bg-green-50]="atividade.concluida"
      [class.border-green-100]="atividade.concluida"
      [class.shadow-sm]="!atividade.concluida"
      [style.background-color]="atividade.concluida ? null : 'var(--cor-card-fundo)'"
      [style.border-color]="atividade.concluida ? null : 'var(--cor-borda-sutil)'"
    >
      <div class="flex items-start gap-3">
        <!-- Checkbox -->
        <button
          type="button"
          (click)="concluidaChange.emit()"
          class="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
          [class.border-green-500]="atividade.concluida"
          [class.bg-green-500]="atividade.concluida"
          [style.border-color]="atividade.concluida ? null : 'var(--cor-borda-media)'"
          [attr.aria-pressed]="atividade.concluida"
          [attr.aria-label]="(atividade.concluida ? 'Marcar como pendente: ' : 'Marcar como concluída: ') + atividade.titulo"
        >
          @if (atividade.concluida) {
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          }
        </button>

        <!-- Rótulo + título + descrição -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 mb-1">
            <i class="fa-solid fa-book-open text-sm" [style.color]="atividade.tipoCor"></i>
            <span class="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--cor-texto-terciario)]">Atividade</span>
          </div>

          <p
            class="text-base font-semibold leading-snug"
            style="font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif;"
            [class.line-through]="atividade.concluida"
            [style.color]="atividade.concluida ? 'var(--cor-texto-terciario)' : 'var(--cor-texto-principal)'"
          >{{ atividade.titulo }}</p>

          @if (atividade.descricaoSecundaria) {
            <p class="text-xs mt-1 leading-snug line-clamp-2 text-[var(--cor-texto-secundario)]">{{ atividade.descricaoSecundaria }}</p>
          }
        </div>

        <!-- Pontuação em destaque — badge neutro, não compete com o título -->
        <span
          class="badge shrink-0 text-xs font-semibold"
          style="background-color: var(--cor-fundo-sutil); color: var(--cor-texto-secundario);"
        >{{ atividade.pontos }} pts</span>
      </div>

      <!-- Metadados — separados por um divisor sutil -->
      <div class="flex items-center justify-between gap-3 flex-wrap mt-3 pt-3 border-t" style="border-color: var(--cor-borda-sutil);">
        <div class="flex items-center gap-3 flex-wrap min-w-0">
          <span class="badge text-white text-[0.7rem] shrink-0" [style.background-color]="atividade.tipoCor">{{ atividade.tipoLabel }}</span>

          @if (mostrarDisciplina && atividade.disciplinaNome) {
            @if (linkDisciplina && atividade.disciplinaId) {
              <a
                [routerLink]="['/disciplinas', atividade.disciplinaId]"
                class="inline-flex items-center gap-1.5 text-xs min-w-0 transition-colors text-[var(--cor-texto-secundario)] hover:text-[var(--cor-primaria)]"
              >
                <span class="w-2 h-2 rounded-full shrink-0" [style.background-color]="atividade.disciplinaCor"></span>
                <span class="truncate">{{ atividade.disciplinaNome }}</span>
              </a>
            } @else {
              <span class="inline-flex items-center gap-1.5 text-xs min-w-0 text-[var(--cor-texto-secundario)]">
                <span class="w-2 h-2 rounded-full shrink-0" [style.background-color]="atividade.disciplinaCor"></span>
                <span class="truncate">{{ atividade.disciplinaNome }}</span>
              </span>
            }
          }
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <span
            class="inline-flex items-center gap-1.5 text-xs font-medium"
            [class.text-rose-500]="atividade.urgencia === 'urgente' && !atividade.concluida"
            [class.text-amber-500]="atividade.urgencia === 'em-breve' && !atividade.concluida"
            [style.color]="(atividade.urgencia === 'normal' || atividade.concluida) ? 'var(--cor-texto-secundario)' : null"
          >
            <i class="fa-regular fa-calendar text-[0.65rem]"></i>
            <span>{{ atividade.dataDisplay }}</span>
            @if (atividade.diasRestantes && !atividade.concluida) {
              <span class="font-normal text-[var(--cor-texto-terciario)]">· {{ atividade.diasRestantes }}</span>
            }
          </span>

          <span class="inline-flex items-center gap-1 text-xs text-[var(--cor-texto-terciario)]">
            <i class="fa-solid fa-star text-[0.6rem]"></i>
            <span>{{ atividade.pontos }} pts</span>
          </span>

          <span class="inline-flex items-center gap-1 text-xs font-medium" style="color: var(--cor-secundaria);">
            <i class="fa-solid fa-bolt text-[0.6rem]"></i>
            <span>+{{ atividade.xp }} XP</span>
          </span>
        </div>
      </div>
    </div>
  `,
})
export class AtividadeCardComponent {
  @Input({ required: true }) atividade!: AtividadeCardVm;
  /** disciplina-detalhe já está dentro de uma disciplina — some com o metadado. */
  @Input() mostrarDisciplina = true;
  /** só a lista de /avaliacoes linka o badge de disciplina para /disciplinas/:id. */
  @Input() linkDisciplina = false;
  @Output() concluidaChange = new EventEmitter<void>();
}
