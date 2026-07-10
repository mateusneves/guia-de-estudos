import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DisciplinasService } from '../../services/disciplinas.service';
import { ProgressoService } from '../../services/progresso.service';
import { Avaliacao } from '../../models/models';

type Filtro = 'todas' | 'pendentes' | 'concluidas' | 'sem-data';
type Tipo = string;

interface AvaliacaoComDisciplina extends Avaliacao {
  disciplinaNome: string;
  disciplinaCor: string;
}

@Component({
  selector: 'app-avaliacoes',
  imports: [RouterLink],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Atividades</h1>
        <p class="text-slate-500 text-sm mt-1">{{ todasAvaliacoes.length }} atividades no semestre</p>
      </div>

      <!-- Filtros -->
      <div class="card space-y-3">
        <div>
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Status</p>
          <div class="flex flex-wrap gap-2">
            @for (f of filtrosStatus; track f.key) {
              <button
                (click)="filtroStatus.set(f.key)"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                [class.bg-[#1e3a5f]]="filtroStatus() === f.key"
                [class.text-white]="filtroStatus() === f.key"
                [class.bg-slate-100]="filtroStatus() !== f.key"
                [class.text-slate-600]="filtroStatus() !== f.key"
              >{{ f.label }}</button>
            }
          </div>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tipo</p>
          <div class="flex flex-wrap gap-2">
            @for (t of filtrosTipo; track t.key) {
              <button
                (click)="filtroTipo.set(t.key)"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                [class.bg-[#1e3a5f]]="filtroTipo() === t.key"
                [class.text-white]="filtroTipo() === t.key"
                [class.bg-slate-100]="filtroTipo() !== t.key"
                [class.text-slate-600]="filtroTipo() !== t.key"
              >{{ t.label }}</button>
            }
          </div>
        </div>
      </div>

      <!-- Resultados count -->
      <p class="text-sm text-slate-500">
        Exibindo <strong class="text-slate-800">{{ avaliacoesFiltradas().length }}</strong> atividades
      </p>

      <!-- Avaliações com data (agrupadas por mês) -->
      @if (avaliacoesComData().length > 0) {
        <div class="space-y-6">
          @for (grupo of gruposPorMes(); track grupo.mes) {
            <div>
              <div class="flex items-center gap-3 mb-3">
                <div class="h-px flex-1 bg-slate-200"></div>
                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ grupo.mes }}</span>
                <div class="h-px flex-1 bg-slate-200"></div>
              </div>
              <div class="space-y-2">
                @for (av of grupo.avaliacoes; track av.id) {
                  <div
                    class="flex items-start gap-3 p-4 rounded-xl border transition-all group"
                    [class.bg-green-50]="storage.isConcluida(av.id)"
                    [class.border-green-100]="storage.isConcluida(av.id)"
                    [class.bg-white]="!storage.isConcluida(av.id)"
                    [class.border-slate-100]="!storage.isConcluida(av.id)"
                    [class.shadow-sm]="!storage.isConcluida(av.id)"
                  >
                    <button
                      (click)="storage.toggleConcluida(av.id)"
                      class="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                      [class.border-slate-300]="!storage.isConcluida(av.id)"
                      [class.border-green-500]="storage.isConcluida(av.id)"
                      [class.bg-green-500]="storage.isConcluida(av.id)"
                    >
                      @if (storage.isConcluida(av.id)) {
                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                        </svg>
                      }
                    </button>

                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-medium leading-snug"
                        [class.text-slate-800]="!storage.isConcluida(av.id)"
                        [class.text-slate-400]="storage.isConcluida(av.id)"
                        [class.line-through]="storage.isConcluida(av.id)"
                      >{{ av.nome || av.descricao }}</p>
                      @if (av.nome && av.descricao) {
                        <p class="text-xs text-slate-500 mt-0.5 leading-snug">{{ av.descricao }}</p>
                      }
                      <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                        <a [routerLink]="['/disciplinas', av.disciplinaId]"
                           class="badge text-white text-xs hover:opacity-80 transition-opacity"
                           [style.background-color]="av.disciplinaCor">
                          {{ av.disciplinaNome }}
                        </a>
                        <span class="badge text-white text-xs" [style.background-color]="getCorTipo(av.tipo)">{{ labelTipo(av.tipo) }}</span>
                        <span class="text-xs text-slate-400">{{ av.pontos }} pts</span>
                      </div>
                    </div>

                    <div class="shrink-0 text-right">
                      <p
                        class="text-sm font-bold"
                        [class.text-rose-500]="isUrgente(av.data) && !storage.isConcluida(av.id)"
                        [class.text-amber-500]="isEmBreve(av.data) && !isUrgente(av.data) && !storage.isConcluida(av.id)"
                        [class.text-slate-600]="!isUrgente(av.data) && !isEmBreve(av.data) || storage.isConcluida(av.id)"
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
        </div>
      }

      <!-- Avaliações sem data (contínuas) -->
      @if (avaliacoesSemData().length > 0 && (filtroStatus() === 'todas' || filtroStatus() === 'sem-data')) {
        <div>
          <div class="flex items-center gap-3 mb-3">
            <div class="h-px flex-1 bg-slate-200"></div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contínuas / Sem data fixa</span>
            <div class="h-px flex-1 bg-slate-200"></div>
          </div>
          <div class="space-y-2">
            @for (av of avaliacoesSemData(); track av.id) {
              <div
                class="flex items-start gap-3 p-4 rounded-xl border transition-all"
                [class.bg-green-50]="storage.isConcluida(av.id)"
                [class.border-green-100]="storage.isConcluida(av.id)"
                [class.bg-white]="!storage.isConcluida(av.id)"
                [class.border-slate-100]="!storage.isConcluida(av.id)"
                [class.shadow-sm]="!storage.isConcluida(av.id)"
              >
                <button
                  (click)="storage.toggleConcluida(av.id)"
                  class="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                  [class.border-slate-300]="!storage.isConcluida(av.id)"
                  [class.border-green-500]="storage.isConcluida(av.id)"
                  [class.bg-green-500]="storage.isConcluida(av.id)"
                >
                  @if (storage.isConcluida(av.id)) {
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  }
                </button>
                <div class="flex-1 min-w-0">
                  <p
                    class="text-sm font-medium leading-snug"
                    [class.text-slate-800]="!storage.isConcluida(av.id)"
                    [class.text-slate-400]="storage.isConcluida(av.id)"
                    [class.line-through]="storage.isConcluida(av.id)"
                  >{{ av.nome || av.descricao }}</p>
                  @if (av.nome && av.descricao) {
                    <p class="text-xs text-slate-500 mt-0.5 leading-snug">{{ av.descricao }}</p>
                  }
                  <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span class="w-2 h-2 rounded-full shrink-0" [style.background-color]="av.disciplinaCor"></span>
                    <a [routerLink]="['/disciplinas', av.disciplinaId]" class="text-xs text-slate-500 hover:text-[#1e3a5f]">{{ av.disciplinaNome }}</a>
                    <span class="badge text-white text-xs" [style.background-color]="getCorTipo(av.tipo)">{{ labelTipo(av.tipo) }}</span>
                    <span class="text-xs text-slate-400">{{ av.pontos }} pts</span>
                  </div>
                </div>
                <div class="shrink-0">
                  <p class="text-xs text-slate-400 text-right">{{ av.dataDisplay }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (avaliacoesFiltradas().length === 0) {
        <div class="card text-center py-12">
          <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p class="text-slate-400">Nenhuma atividade encontrada com estes filtros.</p>
        </div>
      }

    </div>
  `,
})
export class AvaliacoesComponent {
  private disciplinasService = inject(DisciplinasService);
  filtroStatus = signal<Filtro>('pendentes');
  filtroTipo = signal<Tipo>('todos');

  filtrosStatus: { key: Filtro; label: string }[] = [
    { key: 'todas', label: 'Todas' },
    { key: 'pendentes', label: 'Pendentes' },
    { key: 'concluidas', label: 'Concluídas' },
    { key: 'sem-data', label: 'Contínuas' },
  ];

  private readonly LABELS_TIPO: Record<string, string> = {
    prova: 'Prova', trabalho: 'Trabalho', projeto: 'Projeto',
    leitura: 'Leitura', declaracao: 'Declaração', teste: 'Teste',
    continuo: 'Contínuo', tarefa: 'Tarefa', atividade: 'Atividade',
  };

  get filtrosTipo(): { key: string; label: string }[] {
    const tiposPresentes = [...new Set(this.todasAvaliacoes.map(a => a.tipo))];
    const opcoes = tiposPresentes.map(t => ({
      key: t,
      label: this.LABELS_TIPO[t] ?? (t.charAt(0).toUpperCase() + t.slice(1)),
    }));
    return [{ key: 'todos', label: 'Todos' }, ...opcoes];
  }

  constructor(public storage: ProgressoService) {}

  get todasAvaliacoes(): AvaliacaoComDisciplina[] {
    return this.disciplinasService.disciplinas().flatMap(d =>
      d.avaliacoes.map(a => ({ ...a, disciplinaNome: d.nome, disciplinaCor: d.cor }))
    );
  }

  avaliacoesFiltradas = computed<AvaliacaoComDisciplina[]>(() => {
    const s = this.filtroStatus();
    const t = this.filtroTipo();
    return this.todasAvaliacoes.filter(av => {
      const tipoOk = t === 'todos' || av.tipo === t;
      let statusOk = true;
      if (s === 'pendentes') statusOk = !this.storage.isConcluida(av.id) && av.data !== null;
      if (s === 'concluidas') statusOk = this.storage.isConcluida(av.id);
      if (s === 'sem-data') statusOk = av.data === null;
      return tipoOk && statusOk;
    });
  });

  avaliacoesComData = computed(() =>
    this.avaliacoesFiltradas()
      .filter(a => a.data !== null)
      .sort((a, b) => new Date(a.data!).getTime() - new Date(b.data!).getTime())
  );

  avaliacoesSemData = computed(() =>
    this.avaliacoesFiltradas().filter(a => a.data === null)
  );

  gruposPorMes = computed(() => {
    const grupos = new Map<string, AvaliacaoComDisciplina[]>();
    for (const av of this.avaliacoesComData()) {
      const d = new Date(av.data!);
      const mes = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const capitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
      if (!grupos.has(capitalizado)) grupos.set(capitalizado, []);
      grupos.get(capitalizado)!.push(av);
    }
    return [...grupos.entries()].map(([mes, avaliacoes]) => ({ mes, avaliacoes }));
  });

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
    return `em ${dias} dias`;
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
