import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DisciplinasService } from '../../services/disciplinas.service';
import { ProgressoService } from '../../services/progresso.service';
import { Avaliacao, Disciplina } from '../../models/models';

@Component({
  selector: 'app-disciplina-detalhe',
  imports: [RouterLink],
  template: `
    @if (disciplina(); as d) {
      <div class="p-6 max-w-5xl mx-auto space-y-6">
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 text-sm">
          <a routerLink="/disciplinas" class="text-slate-400 hover:text-[#1e3a5f]">Disciplinas</a>
          <span class="text-slate-300">›</span>
          <span class="text-slate-700 font-medium">{{ d.nome }}</span>
        </div>

        <!-- Header -->
        <div class="flex items-start gap-4">
          <span
            class="inline-flex items-center justify-center w-14 h-14 rounded-xl text-white text-lg font-bold shrink-0"
            [style.background-color]="d.cor"
          >{{ d.codigo.substring(0, 2) }}</span>
          <div>
            <p class="text-xs text-slate-400 font-mono">{{ d.codigo }}</p>
            <h1 class="text-2xl font-bold text-slate-800">{{ d.nome }}</h1>
            @if (d.avaliacoes.length > 0) {
              <div class="flex items-center gap-4 mt-2 text-sm text-slate-500">
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
              <span class="font-medium text-slate-700">Progresso Geral</span>
              <span class="font-bold" [style.color]="d.cor">{{ getConcluidas(d) }}/{{ d.avaliacoes.length }} concluídas</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2.5">
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
                <h2 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                  Avaliações
                </h2>
                <div class="space-y-3">
                  @for (av of d.avaliacoes; track av.id) {
                    <div
                      class="flex items-start gap-3 p-3 rounded-xl border transition-all"
                      [class.bg-green-50]="storage.isConcluida(av.id)"
                      [class.border-green-100]="storage.isConcluida(av.id)"
                      [class.bg-slate-50]="!storage.isConcluida(av.id)"
                      [class.border-slate-100]="!storage.isConcluida(av.id)"
                    >
                      <!-- Checkbox -->
                      <button
                        (click)="storage.toggleConcluida(av.id)"
                        class="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                        [class.border-slate-300]="!storage.isConcluida(av.id)"
                        [class.hover:border-green-400]="!storage.isConcluida(av.id)"
                        [class.border-green-500]="storage.isConcluida(av.id)"
                        [class.bg-green-500]="storage.isConcluida(av.id)"
                      >
                        @if (storage.isConcluida(av.id)) {
                          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        }
                      </button>

                      <!-- Content -->
                      <div class="flex-1 min-w-0">
                        <p
                          class="text-sm font-medium leading-snug"
                          [class.text-slate-800]="!storage.isConcluida(av.id)"
                          [class.text-slate-400]="storage.isConcluida(av.id)"
                          [class.line-through]="storage.isConcluida(av.id)"
                        >{{ av.descricao }}</p>
                        <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span
                            class="badge text-white text-xs"
                            [style.background-color]="getCorTipo(av.tipo)"
                          >{{ labelTipo(av.tipo) }}</span>
                          <span class="text-xs text-slate-400">{{ av.pontos }} pontos</span>
                        </div>
                      </div>

                      <!-- Data -->
                      <div class="shrink-0 text-right">
                        <p
                          class="text-xs font-semibold"
                          [class.text-rose-500]="isUrgente(av.data) && !storage.isConcluida(av.id)"
                          [class.text-amber-500]="isEmBreve(av.data) && !isUrgente(av.data) && !storage.isConcluida(av.id)"
                          [class.text-slate-500]="!isUrgente(av.data) && !isEmBreve(av.data) || storage.isConcluida(av.id)"
                        >{{ av.dataDisplay }}</p>
                        @if (av.data && !storage.isConcluida(av.id)) {
                          <p class="text-xs text-slate-400">{{ getDiasRestantes(av.data) }}</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Conteúdo Programático -->
            <div class="card">
              <h2 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
                Conteúdo Programático
              </h2>
              <div class="space-y-2">
                @for (item of d.conteudoProgramatico; track item.unidade) {
                  <div class="flex gap-3 py-2 border-b border-slate-50 last:border-0">
                    <span
                      class="shrink-0 text-xs font-semibold mt-0.5 px-2 py-0.5 rounded text-white"
                      [style.background-color]="d.cor"
                    >{{ item.unidade }}</span>
                    <p class="text-sm text-slate-700 leading-relaxed">{{ item.descricao }}</p>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Sidebar direita -->
          <div class="space-y-4">
            <!-- Notas pessoais -->
            <div class="card">
              <h3 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Notas Pessoais
              </h3>
              <textarea
                class="w-full text-sm border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 text-slate-700 placeholder-slate-300"
                rows="5"
                placeholder="Anotações, lembretes, observações..."
                [value]="storage.getNota(d.id)"
                (input)="storage.setNota(d.id, $any($event.target).value)"
              ></textarea>
            </div>

            <!-- Bibliografia -->
            @if (d.bibliografia.length > 0) {
              <div class="card">
                <h3 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  Bibliografia
                </h3>
                <ul class="space-y-2">
                  @for (bib of d.bibliografia; track bib) {
                    <li class="text-xs text-slate-600 leading-relaxed border-l-2 pl-3" [style.border-color]="d.cor">
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
        <p class="text-slate-500">Disciplina não encontrada.</p>
        <a routerLink="/disciplinas" class="text-[#1e3a5f] hover:underline text-sm">← Voltar</a>
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
}
