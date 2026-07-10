import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DisciplinasService } from '../../services/disciplinas.service';
import { ProgressoService } from '../../services/progresso.service';
import { Disciplina } from '../../models/models';

@Component({
  selector: 'app-progresso',
  imports: [RouterLink],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Progresso do Semestre</h1>
        <p class="text-slate-500 text-sm mt-1">Acompanhamento geral de avaliações e pontuação</p>
      </div>

      <!-- Visão geral -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card text-center">
          <p class="text-3xl font-bold text-[#1e3a5f]">{{ totalAvaliacoes }}</p>
          <p class="text-xs text-slate-500 mt-1">Total de Avaliações</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-green-600">{{ totalConcluidas }}</p>
          <p class="text-xs text-slate-500 mt-1">Concluídas</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-amber-500">{{ totalPendentes }}</p>
          <p class="text-xs text-slate-500 mt-1">Pendentes</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-[#c9a84c]">{{ percentualGeral }}%</p>
          <p class="text-xs text-slate-500 mt-1">Progresso Geral</p>
        </div>
      </div>

      <!-- Barra geral -->
      <div class="card">
        <div class="flex justify-between items-center mb-3">
          <h2 class="font-semibold text-slate-800">Progresso Geral do Semestre</h2>
          <span class="text-sm font-bold text-[#1e3a5f]">{{ totalConcluidas }}/{{ totalAvaliacoes }}</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-4">
          <div
            class="h-4 rounded-full transition-all duration-700"
            style="background: linear-gradient(90deg, #1e3a5f, #c9a84c)"
            [style.width.%]="percentualGeral"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-slate-400 mt-1">
          <span>Início</span>
          <span>{{ totalPontosConcluidos }}/{{ totalPontos }} pontos obtidos</span>
          <span>Fim</span>
        </div>
      </div>

      <!-- Por disciplina -->
      <div>
        <h2 class="font-semibold text-slate-800 mb-4">Por Disciplina</h2>
        <div class="space-y-3">
          @for (d of disciplinasComAvaliacoes; track d.id) {
            <div class="card">
              <div class="flex items-center gap-3 mb-3">
                <a
                  [routerLink]="['/disciplinas', d.id]"
                  class="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white text-xs font-bold shrink-0 hover:opacity-80 transition-opacity"
                  [style.background-color]="d.cor"
                >{{ d.codigo.substring(0, 2) }}</a>
                <div class="flex-1 min-w-0">
                  <a [routerLink]="['/disciplinas', d.id]" class="text-sm font-semibold text-slate-800 hover:text-[#1e3a5f] transition-colors">{{ d.nome }}</a>
                  <p class="text-xs text-slate-400 font-mono">{{ d.codigo }}</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-sm font-bold" [style.color]="d.cor">{{ getProgresso(d) }}%</p>
                  <p class="text-xs text-slate-400">{{ getConcluidas(d) }}/{{ d.avaliacoes.length }}</p>
                </div>
              </div>

              <div class="w-full bg-slate-100 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  [style.width.%]="getProgresso(d)"
                  [style.background-color]="d.cor"
                ></div>
              </div>

              <!-- Lista de avaliações -->
              <div class="mt-3 space-y-1">
                @for (av of d.avaliacoes; track av.id) {
                  <button
                    (click)="storage.toggleConcluida(av.id)"
                    class="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-left transition-colors"
                    [class.bg-green-50]="storage.isConcluida(av.id)"
                    [class.bg-slate-50]="!storage.isConcluida(av.id)"
                  >
                    <span
                      class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                      [class.border-green-500]="storage.isConcluida(av.id)"
                      [class.bg-green-500]="storage.isConcluida(av.id)"
                      [class.border-slate-300]="!storage.isConcluida(av.id)"
                    >
                      @if (storage.isConcluida(av.id)) {
                        <svg class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                        </svg>
                      }
                    </span>
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-xs font-medium leading-snug"
                        [class.text-slate-700]="!storage.isConcluida(av.id)"
                        [class.text-green-700]="storage.isConcluida(av.id)"
                        [class.line-through]="storage.isConcluida(av.id)"
                      >{{ av.descricao }}</p>
                      <div class="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span class="badge text-white text-xs" [style.background-color]="getCorTipo(av.tipo)">{{ labelTipo(av.tipo) }}</span>
                        <span class="text-xs text-slate-400">{{ av.dataDisplay }} · {{ av.pontos }} pts</span>
                      </div>
                    </div>
                  </button>
                }
              </div>

              <!-- Pontos -->
              <div class="mt-3 pt-3 border-t border-slate-50 flex justify-between text-xs text-slate-400">
                <span>Pontos concluídos: <strong class="text-slate-700">{{ getPontosConcluidos(d) }}</strong></span>
                <span>Total: <strong class="text-slate-700">{{ getTotalPontos(d) }} pts</strong></span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Gráfico de pontos por tipo -->
      <div class="card">
        <h2 class="font-semibold text-slate-800 mb-4">Distribuição por Tipo de Avaliação</h2>
        <div class="space-y-3">
          @for (stat of estatsPorTipo; track stat.tipo) {
            <div>
              <div class="flex justify-between text-xs mb-1">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-sm" [style.background-color]="stat.cor"></span>
                  <span class="text-slate-700 font-medium">{{ stat.label }}</span>
                </div>
                <span class="text-slate-500">{{ stat.concluidas }}/{{ stat.total }} avaliações</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  class="h-1.5 rounded-full transition-all"
                  [style.width.%]="stat.total > 0 ? (stat.concluidas / stat.total * 100) : 0"
                  [style.background-color]="stat.cor"
                ></div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Backup -->
      <div class="card">
        <h2 class="font-semibold text-slate-800 mb-1">Backup dos Dados</h2>
        <p class="text-xs text-slate-500 mb-4">
          Suas marcações e notas ficam salvas no navegador. Use o backup para não perdê-las
          ao limpar o cache ou para transferir para outro dispositivo.
        </p>

        <div class="flex flex-wrap gap-3">
          <!-- Exportar -->
          <button
            (click)="exportar()"
            class="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d5a8e] transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Exportar backup (.json)
          </button>

          <!-- Importar -->
          <label
            class="flex items-center gap-2 px-4 py-2 border border-[#1e3a5f] text-[#1e3a5f] rounded-lg text-sm font-medium hover:bg-[#1e3a5f] hover:text-white transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            Importar backup (.json)
            <input type="file" accept=".json" class="hidden" (change)="onArquivoSelecionado($event)">
          </label>
        </div>

        <!-- Mensagem de feedback -->
        @if (mensagemFeedback()) {
          <div
            class="mt-3 flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
            [class.bg-green-50]="tipoFeedback() === 'sucesso'"
            [class.text-green-700]="tipoFeedback() === 'sucesso'"
            [class.bg-red-50]="tipoFeedback() === 'erro'"
            [class.text-red-700]="tipoFeedback() === 'erro'"
          >
            @if (tipoFeedback() === 'sucesso') {
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            } @else {
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
            {{ mensagemFeedback() }}
          </div>
        }

        <!-- Aviso de sobrescrita -->
        @if (confirmarImportacao()) {
          <div class="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p class="text-sm font-semibold text-amber-800 mb-1">Atenção: isso vai substituir todos os dados atuais.</p>
            <p class="text-xs text-amber-700 mb-3">Suas marcações e notas atuais serão apagadas e substituídas pelo backup. Deseja continuar?</p>
            <div class="flex gap-2">
              <button
                (click)="confirmarImportar()"
                class="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition-colors"
              >Sim, importar</button>
              <button
                (click)="cancelarImportacao()"
                class="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
              >Cancelar</button>
            </div>
          </div>
        }
      </div>

    </div>
  `,
})
export class ProgressoComponent {
  private disciplinasService = inject(DisciplinasService);
  get disciplinas() { return this.disciplinasService.disciplinas(); }

  mensagemFeedback = signal('');
  tipoFeedback = signal<'sucesso' | 'erro'>('sucesso');
  confirmarImportacao = signal(false);
  private arquivoPendente: File | null = null;

  constructor(public storage: ProgressoService) {}

  exportar(): void {
    this.storage.exportar();
    this.mostrarFeedback('sucesso', 'Backup exportado com sucesso!');
  }

  onArquivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.arquivoPendente = input.files[0];
    this.confirmarImportacao.set(true);
    this.mensagemFeedback.set('');
    input.value = '';
  }

  confirmarImportar(): void {
    if (!this.arquivoPendente) return;
    this.confirmarImportacao.set(false);
    this.storage.importar(this.arquivoPendente).then(({ conclusoes, notas }) => {
      this.arquivoPendente = null;
      this.mostrarFeedback('sucesso', `Backup restaurado: ${conclusoes} atividade(s) marcada(s) e ${notas} nota(s) importada(s).`);
    }).catch((err: Error) => {
      this.arquivoPendente = null;
      this.mostrarFeedback('erro', err.message);
    });
  }

  cancelarImportacao(): void {
    this.arquivoPendente = null;
    this.confirmarImportacao.set(false);
  }

  private mostrarFeedback(tipo: 'sucesso' | 'erro', mensagem: string): void {
    this.tipoFeedback.set(tipo);
    this.mensagemFeedback.set(mensagem);
    setTimeout(() => this.mensagemFeedback.set(''), 5000);
  }

  get disciplinasComAvaliacoes(): Disciplina[] {
    return this.disciplinas.filter(d => d.avaliacoes.length > 0);
  }

  get totalAvaliacoes(): number {
    return this.disciplinas.reduce((s, d) => s + d.avaliacoes.length, 0);
  }

  get totalConcluidas(): number {
    return this.disciplinas.reduce((s, d) =>
      s + d.avaliacoes.filter(a => this.storage.isConcluida(a.id)).length, 0
    );
  }

  get totalPendentes(): number {
    return this.totalAvaliacoes - this.totalConcluidas;
  }

  get percentualGeral(): number {
    if (this.totalAvaliacoes === 0) return 0;
    return Math.round((this.totalConcluidas / this.totalAvaliacoes) * 100);
  }

  get totalPontos(): number {
    return this.disciplinas.reduce((s, d) => s + d.avaliacoes.reduce((ss, a) => ss + a.pontos, 0), 0);
  }

  get totalPontosConcluidos(): number {
    return this.disciplinas.reduce((s, d) =>
      s + d.avaliacoes.filter(a => this.storage.isConcluida(a.id)).reduce((ss, a) => ss + a.pontos, 0), 0
    );
  }

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

  getPontosConcluidos(d: Disciplina): number {
    return d.avaliacoes.filter(a => this.storage.isConcluida(a.id)).reduce((s, a) => s + a.pontos, 0);
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

  get estatsPorTipo() {
    const tipos = [
      { tipo: 'prova', label: 'Provas', cor: '#dc2626' },
      { tipo: 'trabalho', label: 'Trabalhos', cor: '#2563eb' },
      { tipo: 'projeto', label: 'Projetos', cor: '#7c3aed' },
      { tipo: 'leitura', label: 'Leituras', cor: '#059669' },
      { tipo: 'declaracao', label: 'Declarações de Leitura', cor: '#0891b2' },
      { tipo: 'teste', label: 'Testes/Questionários', cor: '#d97706' },
      { tipo: 'continuo', label: 'Avaliações Contínuas', cor: '#64748b' },
    ];

    const todas = this.disciplinas.flatMap(d => d.avaliacoes);
    return tipos.map(t => ({
      ...t,
      total: todas.filter(a => a.tipo === t.tipo).length,
      concluidas: todas.filter(a => a.tipo === t.tipo && this.storage.isConcluida(a.id)).length,
    })).filter(t => t.total > 0);
  }
}
