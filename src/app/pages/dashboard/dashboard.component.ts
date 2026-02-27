import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HORARIO } from '../../data/curso.data';
import { SheetsService } from '../../services/sheets.service';
import { StorageService } from '../../services/storage.service';
import { Avaliacao, AulaHorario } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <div class="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p class="text-slate-500 text-sm mt-1">Bem-vindo ao seu guia de estudos — {{ nomesDia[diaSemanaAtual] }}</p>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card text-center">
          <p class="text-3xl font-bold text-[#1e3a5f]">{{ totalDisciplinas }}</p>
          <p class="text-xs text-slate-500 mt-1">Disciplinas</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-[#c9a84c]">{{ totalAvaliacoes }}</p>
          <p class="text-xs text-slate-500 mt-1">Avaliações</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-green-600">{{ totalConcluidas }}</p>
          <p class="text-xs text-slate-500 mt-1">Concluídas</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-rose-500">{{ proximasEntregas }}</p>
          <p class="text-xs text-slate-500 mt-1">Próximos 30 dias</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">

        <!-- Aulas de hoje -->
        <div class="card lg:col-span-1">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-slate-800">Aulas de Hoje</h2>
            <a routerLink="/horario" class="text-xs text-[#1e3a5f] hover:underline">Ver horário</a>
          </div>
          @if (aulasHoje.length > 0) {
            <div class="space-y-3">
              @for (aula of aulasHoje; track aula.horario) {
                <div class="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <span
                    class="inline-flex items-center justify-center w-7 h-7 rounded-md text-white text-xs font-bold shrink-0"
                    [style.background-color]="getCorDisciplina(aula.disciplinaId)"
                  >{{ aula.modulo }}</span>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-slate-800 leading-snug truncate">{{ getNomeCurto(aula.disciplina) }}</p>
                    <p class="text-xs text-slate-400 mt-0.5">{{ aula.horario }}</p>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="flex flex-col items-center justify-center py-8 text-center">
              <svg class="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
              <p class="text-sm text-slate-400">Sem aulas hoje</p>
              <p class="text-xs text-slate-300">Aproveite para estudar!</p>
            </div>
          }
        </div>

        <!-- Próximas entregas -->
        <div class="card lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-slate-800">Próximas Entregas</h2>
            <a routerLink="/avaliacoes" class="text-xs text-[#1e3a5f] hover:underline">Ver todas</a>
          </div>
          @if (proximasAvaliacoes.length > 0) {
            <div class="space-y-2">
              @for (av of proximasAvaliacoes; track av.id) {
                <div
                  class="flex items-start gap-3 p-3 rounded-lg border transition-colors"
                  [class.border-slate-100]="!storage.isConcluida(av.id)"
                  [class.bg-slate-50]="!storage.isConcluida(av.id)"
                  [class.border-green-100]="storage.isConcluida(av.id)"
                  [class.bg-green-50]="storage.isConcluida(av.id)"
                >
                  <!-- Checkbox -->
                  <button
                    (click)="storage.toggleConcluida(av.id)"
                    class="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
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

                  <!-- Conteúdo — empilhado, sem bloco fixo na direita -->
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm font-medium leading-snug"
                      [class.text-slate-800]="!storage.isConcluida(av.id)"
                      [class.line-through]="storage.isConcluida(av.id)"
                      [class.text-slate-400]="storage.isConcluida(av.id)"
                    >{{ av.descricao }}</p>
                    <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        class="inline-block w-2 h-2 rounded-full shrink-0"
                        [style.background-color]="getCorDisciplina(av.disciplinaId)"
                      ></span>
                      <span class="text-xs text-slate-500">{{ getNomeDisciplina(av.disciplinaId) }}</span>
                      <span
                        class="badge text-white"
                        [style.background-color]="getCorTipo(av.tipo)"
                      >{{ labelTipo(av.tipo) }}</span>
                      <span
                        class="text-xs font-semibold"
                        [class.text-rose-500]="isUrgente(av.data)"
                        [class.text-slate-600]="!isUrgente(av.data)"
                      >{{ av.dataDisplay }}</span>
                      <span class="text-xs text-slate-400">· {{ av.pontos }} pts</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="flex flex-col items-center justify-center py-8 text-center">
              <svg class="w-10 h-10 text-green-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-slate-400">Sem entregas pendentes!</p>
            </div>
          }
        </div>

      </div>

      <!-- Disciplinas grid -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-slate-800">Disciplinas do Semestre</h2>
          <a routerLink="/disciplinas" class="text-xs text-[#1e3a5f] hover:underline">Ver todas</a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          @for (d of disciplinas; track d.id) {
            @if (d.avaliacoes.length > 0) {
              <a
                [routerLink]="['/disciplinas', d.id]"
                class="card hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div class="flex items-start gap-3">
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-xs font-bold shrink-0"
                    [style.background-color]="d.cor"
                  >{{ d.codigo.substring(0, 2) }}</span>
                  <div class="min-w-0">
                    <p class="text-xs text-slate-500 font-mono">{{ d.codigo }}</p>
                    <p class="text-sm font-semibold text-slate-800 leading-snug group-hover:text-[#1e3a5f] transition-colors">{{ d.nome }}</p>
                  </div>
                </div>
                <div class="mt-3">
                  <div class="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{{ getConcluidas(d.id) }}/{{ d.avaliacoes.length }} tarefas</span>
                    <span>{{ getProgresso(d.id) }}%</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      class="h-1.5 rounded-full transition-all"
                      [style.width.%]="getProgresso(d.id)"
                      [style.background-color]="d.cor"
                    ></div>
                  </div>
                </div>
              </a>
            }
          }
        </div>
      </div>

    </div>
  `,
})
export class DashboardComponent {
  private sheets = inject(SheetsService);
  get disciplinas() { return this.sheets.disciplinas(); }

  nomesDia: Record<string, string> = {
    'Segunda': 'Segunda-feira',
    'Terça': 'Terça-feira',
    'Quarta': 'Quarta-feira',
    'Quinta': 'Quinta-feira',
    'Sexta': 'Sexta-feira',
    'Sábado': 'Sábado',
    'Domingo': 'Domingo',
  };

  diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  get diaSemanaAtual(): string {
    return this.diasSemana[new Date().getDay()];
  }

  get aulasHoje(): AulaHorario[] {
    return HORARIO.filter(a => a.dia === this.diaSemanaAtual);
  }

  get totalDisciplinas() {
    return this.disciplinas.filter(d => d.avaliacoes.length > 0).length;
  }

  get totalAvaliacoes() {
    return this.disciplinas.reduce((sum, d) => sum + d.avaliacoes.length, 0);
  }

  get totalConcluidas() {
    return this.disciplinas.reduce((sum, d) => sum + d.avaliacoes.filter(a => this.storage.isConcluida(a.id)).length, 0);
  }

  get proximasEntregas() {
    const em30dias = new Date();
    em30dias.setDate(em30dias.getDate() + 30);
    return this.disciplinas.flatMap(d => d.avaliacoes).filter(a => {
      if (!a.data || this.storage.isConcluida(a.id)) return false;
      return new Date(a.data) <= em30dias;
    }).length;
  }

  get proximasAvaliacoes(): Avaliacao[] {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return this.disciplinas.flatMap(d => d.avaliacoes)
      .filter(a => a.data && new Date(a.data) >= hoje)
      .sort((a, b) => new Date(a.data!).getTime() - new Date(b.data!).getTime())
      .slice(0, 8);
  }

  constructor(public storage: StorageService) {}

  getNomeDisciplina(id: string): string {
    return this.disciplinas.find(d => d.id === id)?.nome ?? id;
  }

  getCorDisciplina(id: string): string {
    return this.disciplinas.find(d => d.id === id)?.cor ?? '#64748b';
  }

  getNomeCurto(nome: string): string {
    return nome.replace(/^[A-Z0-9]+ - /, '');
  }

  getConcluidas(disciplinaId: string): number {
    const d = this.disciplinas.find(d => d.id === disciplinaId);
    return d?.avaliacoes.filter(a => this.storage.isConcluida(a.id)).length ?? 0;
  }

  getProgresso(disciplinaId: string): number {
    const d = this.disciplinas.find(d => d.id === disciplinaId);
    if (!d || d.avaliacoes.length === 0) return 0;
    return Math.round((this.getConcluidas(disciplinaId) / d.avaliacoes.length) * 100);
  }

  isUrgente(data: string | null): boolean {
    if (!data) return false;
    const diff = new Date(data).getTime() - new Date().getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }

  labelTipo(tipo: string): string {
    const map: Record<string, string> = {
      prova: 'Prova', trabalho: 'Trabalho', leitura: 'Leitura',
      continuo: 'Contínuo', teste: 'Teste', projeto: 'Projeto',
      declaracao: 'Decl.', tarefa: 'Tarefa', atividade: 'Atividade',
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
