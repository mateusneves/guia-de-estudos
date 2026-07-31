import { Component, computed, inject, signal } from '@angular/core';
import { DisciplinasService } from '../../services/disciplinas.service';
import { ProgressoService } from '../../services/progresso.service';
import { XP_POR_ATIVIDADE } from '../../services/gamificacao.service';
import { Avaliacao } from '../../models/models';
import { AtividadeCardComponent, AtividadeCardVm } from '../../shared/atividade-card/atividade-card.component';

type Filtro = 'todas' | 'pendentes' | 'concluidas' | 'sem-data';
type Tipo = string;

interface AvaliacaoComDisciplina extends Avaliacao {
  disciplinaNome: string;
  disciplinaCor: string;
}

@Component({
  selector: 'app-avaliacoes',
  imports: [AtividadeCardComponent],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-[var(--cor-texto-principal)]">Atividades</h1>
        <p class="text-[var(--cor-texto-secundario)] text-sm mt-1">{{ todasAvaliacoes.length }} atividades no semestre</p>
      </div>

      <!-- Filtros -->
      <div class="card space-y-3">
        <div>
          <p class="text-xs font-semibold text-[var(--cor-texto-terciario)] uppercase tracking-wider mb-2">Status</p>
          <div class="flex flex-wrap gap-2">
            @for (f of filtrosStatus; track f.key) {
              <button
                (click)="filtroStatus.set(f.key)"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                [style.background-color]="filtroStatus() === f.key ? 'var(--cor-primaria)' : 'var(--cor-fundo-sutil)'"
                [style.color]="filtroStatus() === f.key ? '#fff' : 'var(--cor-texto-secundario)'"
              >{{ f.label }}</button>
            }
          </div>
        </div>
        <div>
          <p class="text-xs font-semibold text-[var(--cor-texto-terciario)] uppercase tracking-wider mb-2">Tipo</p>
          <div class="flex flex-wrap gap-2">
            @for (t of filtrosTipo; track t.key) {
              <button
                (click)="filtroTipo.set(t.key)"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                [style.background-color]="filtroTipo() === t.key ? 'var(--cor-primaria)' : 'var(--cor-fundo-sutil)'"
                [style.color]="filtroTipo() === t.key ? '#fff' : 'var(--cor-texto-secundario)'"
              >{{ t.label }}</button>
            }
          </div>
        </div>
      </div>

      <!-- Resultados count -->
      <p class="text-sm text-[var(--cor-texto-secundario)]">
        Exibindo <strong class="text-[var(--cor-texto-principal)]">{{ avaliacoesFiltradas().length }}</strong> atividades
      </p>

      <!-- Avaliações com data (agrupadas por mês) -->
      @if (avaliacoesComData().length > 0) {
        <div class="space-y-6">
          @for (grupo of gruposPorMes(); track grupo.mes) {
            <div>
              <div class="flex items-center gap-3 mb-3">
                <div class="h-px flex-1 bg-[var(--cor-fundo-sutil-forte)]"></div>
                <span class="text-xs font-semibold text-[var(--cor-texto-secundario)] uppercase tracking-wider">{{ grupo.mes }}</span>
                <div class="h-px flex-1 bg-[var(--cor-fundo-sutil-forte)]"></div>
              </div>
              <div class="space-y-3">
                @for (av of grupo.avaliacoes; track av.id) {
                  <app-atividade-card
                    [atividade]="paraVm(av)"
                    [linkDisciplina]="true"
                    (concluidaChange)="storage.toggleConcluida(av.id)"
                  />
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
            <div class="h-px flex-1 bg-[var(--cor-fundo-sutil-forte)]"></div>
            <span class="text-xs font-semibold text-[var(--cor-texto-secundario)] uppercase tracking-wider">Contínuas / Sem data fixa</span>
            <div class="h-px flex-1 bg-[var(--cor-fundo-sutil-forte)]"></div>
          </div>
          <div class="space-y-3">
            @for (av of avaliacoesSemData(); track av.id) {
              <app-atividade-card
                [atividade]="paraVm(av)"
                [linkDisciplina]="true"
                (concluidaChange)="storage.toggleConcluida(av.id)"
              />
            }
          </div>
        </div>
      }

      @if (avaliacoesFiltradas().length === 0) {
        <div class="card text-center py-12">
          <svg class="w-12 h-12 text-[var(--cor-texto-terciario)] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p class="text-[var(--cor-texto-terciario)]">Nenhuma atividade encontrada com estes filtros.</p>
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

  paraVm(av: AvaliacaoComDisciplina): AtividadeCardVm {
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
      disciplinaId: av.disciplinaId,
      disciplinaNome: av.disciplinaNome,
      disciplinaCor: av.disciplinaCor,
    };
  }
}
