import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DisciplinasService } from '../../services/disciplinas.service';
import { ProgressoService } from '../../services/progresso.service';
import { XP_POR_ATIVIDADE } from '../../services/gamificacao.service';
import { Avaliacao, Disciplina } from '../../models/models';
import { AtividadeCardComponent, AtividadeCardVm } from '../../shared/atividade-card/atividade-card.component';

@Component({
  selector: 'app-disciplina-detalhe',
  imports: [RouterLink, AtividadeCardComponent],
  template: `
    @if (disciplina(); as d) {
      <div class="p-6 max-w-5xl mx-auto space-y-6">
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 text-sm">
          <a routerLink="/disciplinas" class="text-[var(--cor-texto-terciario)] hover:text-[var(--cor-primaria)]">Disciplinas</a>
          <span class="text-[var(--cor-texto-terciario)]">›</span>
          <span class="text-[var(--cor-texto-principal)] font-medium">{{ d.nome }}</span>
        </div>

        <!-- Header -->
        <div class="flex items-start gap-4">
          <span
            class="inline-flex items-center justify-center w-14 h-14 rounded-xl text-white text-lg font-bold shrink-0"
            [style.background-color]="d.cor"
          >{{ d.codigo.substring(0, 2) }}</span>
          <div>
            <p class="text-xs text-[var(--cor-texto-terciario)] font-mono">{{ d.codigo }}</p>
            <h1 class="text-2xl font-bold text-[var(--cor-texto-principal)]">{{ d.nome }}</h1>
            @if (d.avaliacoes.length > 0) {
              <div class="flex items-center gap-4 mt-2 text-sm text-[var(--cor-texto-secundario)]">
                <span>{{ d.avaliacoes.length }} avaliações</span>
                <span>{{ getTotalPontos(d) }} pts totais</span>
                <span class="font-semibold" [style.color]="d.cor">{{ getProgresso(d) }}% concluído</span>
              </div>
            }
          </div>
        </div>

        <!-- Progresso bar (se tem avaliações) -->
        @if (d.avaliacoes.length > 0) {
          <div class="card">
            <div class="flex justify-between text-sm mb-2">
              <span class="font-medium text-[var(--cor-texto-principal)]">Progresso Geral</span>
              <span class="font-bold" [style.color]="d.cor">{{ getConcluidas(d) }}/{{ d.avaliacoes.length }} concluídas</span>
            </div>
            <div class="barra-progresso w-full bg-[var(--cor-fundo-sutil)] rounded-full h-2.5">
              <div
                class="h-2.5 rounded-full transition-all duration-500"
                [style.width.%]="getProgresso(d)"
                [style.background-color]="d.cor"
              ></div>
            </div>
          </div>
        }

        <div class="grid lg:grid-cols-3 gap-6">

          <!-- Avaliações -->
          <div class="lg:col-span-2 space-y-4">
            @if (d.avaliacoes.length > 0) {
              <div class="card">
                <h2 class="font-semibold text-[var(--cor-texto-principal)] mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                  Avaliações
                </h2>
                <div class="space-y-3">
                  @for (av of d.avaliacoes; track av.id) {
                    <app-atividade-card
                      [atividade]="paraVm(av)"
                      [mostrarDisciplina]="false"
                      (concluidaChange)="storage.toggleConcluida(av.id)"
                    />
                  }
                </div>
              </div>
            }

            <!-- Conteúdo Programático -->
            @if (d.conteudoProgramatico) {
              <div class="card">
                <h2 class="font-semibold text-[var(--cor-texto-principal)] mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                  </svg>
                  Conteúdo Programático
                </h2>
                <p class="text-sm text-[var(--cor-texto-principal)] leading-relaxed whitespace-pre-wrap">{{ d.conteudoProgramatico }}</p>
              </div>
            }
          </div>

          <!-- Sidebar direita -->
          <div class="space-y-4">
            <!-- Notas pessoais -->
            <div class="card">
              <h3 class="font-semibold text-[var(--cor-texto-principal)] mb-3 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Notas Pessoais
              </h3>
              <textarea
                class="w-full text-sm border border-[var(--cor-borda-media)] rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria-30)] text-[var(--cor-texto-principal)] placeholder-[var(--cor-texto-terciario)]"
                rows="5"
                placeholder="Anotações, lembretes, observações..."
                [value]="storage.getNota(d.id)"
                (input)="storage.setNota(d.id, $any($event.target).value)"
              ></textarea>
            </div>

            <!-- Bibliografia -->
            @if (d.bibliografia.length > 0) {
              <div class="card">
                <h3 class="font-semibold text-[var(--cor-texto-principal)] mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  Bibliografia
                </h3>
                <ul class="space-y-2">
                  @for (bib of d.bibliografia; track bib) {
                    <li class="text-xs text-[var(--cor-texto-secundario)] leading-relaxed border-l-2 pl-3" [style.border-color]="d.cor">
                      {{ bib }}
                    </li>
                  }
                </ul>
              </div>
            }
          </div>

        </div>
      </div>
    } @else {
      <div class="p-6 text-center">
        <p class="text-[var(--cor-texto-secundario)]">Disciplina não encontrada.</p>
        <a routerLink="/disciplinas" class="text-[var(--cor-primaria)] hover:underline text-sm">← Voltar</a>
      </div>
    }
  `,
})
export class DisciplinaDetalheComponent {
  private route = inject(ActivatedRoute);
  private disciplinasService = inject(DisciplinasService);
  storage = inject(ProgressoService);

  disciplina = computed<Disciplina | null>(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return this.disciplinasService.disciplinas().find(d => d.id === id) ?? null;
  });

  getConcluidas(d: Disciplina): number {
    return d.avaliacoes.filter(a => this.storage.isConcluida(a.id)).length;
  }

  getProgresso(d: Disciplina): number {
    if (d.avaliacoes.length === 0) return 0;
    return Math.round((this.getConcluidas(d) / d.avaliacoes.length) * 100);
  }

  getTotalPontos(d: Disciplina): number {
    return d.avaliacoes.reduce((s, a) => s + a.pontos, 0);
  }

  isUrgente(data: string | null): boolean {
    if (!data) return false;
    const diff = new Date(data).getTime() - new Date().getTime();
    return diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }

  isEmBreve(data: string | null): boolean {
    if (!data) return false;
    const diff = new Date(data).getTime() - new Date().getTime();
    return diff >= 0 && diff < 21 * 24 * 60 * 60 * 1000;
  }

  getDiasRestantes(data: string | null): string {
    if (!data) return '';
    const diff = new Date(data).getTime() - new Date().getTime();
    if (diff < 0) return 'Vencida';
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (dias === 0) return 'Hoje!';
    if (dias === 1) return 'Amanhã';
    return `${dias} dias`;
  }

  labelTipo(tipo: string): string {
    const map: Record<string, string> = {
      prova: 'Prova', trabalho: 'Trabalho', leitura: 'Leitura',
      continuo: 'Contínuo', teste: 'Teste', projeto: 'Projeto',
      declaracao: 'Declaração', tarefa: 'Tarefa', atividade: 'Atividade',
    };
    return map[tipo] ?? (tipo.charAt(0).toUpperCase() + tipo.slice(1));
  }

  getCorTipo(tipo: string): string {
    const map: Record<string, string> = {
      prova: '#dc2626', trabalho: '#2563eb', leitura: '#059669',
      continuo: '#64748b', teste: '#d97706', projeto: '#7c3aed',
      declaracao: '#0891b2', tarefa: '#2563eb', atividade: '#2563eb',
    };
    return map[tipo] ?? '#64748b';
  }

  paraVm(av: Avaliacao): AtividadeCardVm {
    const concluida = this.storage.isConcluida(av.id);
    return {
      titulo: av.nome || av.descricao,
      descricaoSecundaria: av.nome && av.descricao ? av.descricao : null,
      concluida,
      tipo: av.tipo,
      tipoLabel: this.labelTipo(av.tipo),
      tipoCor: this.getCorTipo(av.tipo),
      pontos: av.pontos,
      xp: XP_POR_ATIVIDADE,
      dataDisplay: av.dataDisplay,
      diasRestantes: av.data ? this.getDiasRestantes(av.data) : null,
      urgencia: this.isUrgente(av.data) ? 'urgente' : this.isEmBreve(av.data) ? 'em-breve' : 'normal',
      disciplinaId: null,
      disciplinaNome: null,
      disciplinaCor: null,
    };
  }
}
