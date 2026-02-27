import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SheetsService } from '../../services/sheets.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-disciplinas',
  imports: [RouterLink],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Disciplinas</h1>
        <p class="text-slate-500 text-sm mt-1">{{ disciplinas.length }} disciplinas no semestre</p>
      </div>

      <!-- Filtro -->
      <div class="flex flex-wrap gap-2">
        <button
          (click)="filtro.set('todas')"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          [class.bg-[#1e3a5f]]="filtro() === 'todas'"
          [class.text-white]="filtro() === 'todas'"
          [class.bg-slate-100]="filtro() !== 'todas'"
          [class.text-slate-600]="filtro() !== 'todas'"
        >Todas</button>
        <button
          (click)="filtro.set('com-avaliacoes')"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          [class.bg-[#1e3a5f]]="filtro() === 'com-avaliacoes'"
          [class.text-white]="filtro() === 'com-avaliacoes'"
          [class.bg-slate-100]="filtro() !== 'com-avaliacoes'"
          [class.text-slate-600]="filtro() !== 'com-avaliacoes'"
        >Com Avaliações</button>
      </div>

      <!-- Grid de disciplinas -->
      <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (d of disciplinasFiltradas(); track d.id) {
          <a
            [routerLink]="['/disciplinas', d.id]"
            class="card hover:shadow-md transition-all cursor-pointer group border-l-4"
            [style.border-left-color]="d.cor"
          >
            <div class="flex items-start gap-3 mb-4">
              <span
                class="inline-flex items-center justify-center w-10 h-10 rounded-lg text-white text-xs font-bold shrink-0"
                [style.background-color]="d.cor"
              >{{ d.codigo.substring(0, 2) }}</span>
              <div class="min-w-0 flex-1">
                <p class="text-xs text-slate-400 font-mono">{{ d.codigo }}</p>
                <p class="text-base font-semibold text-slate-800 group-hover:text-[#1e3a5f] transition-colors leading-snug">{{ d.nome }}</p>
              </div>
              <svg class="w-4 h-4 text-slate-300 shrink-0 group-hover:text-[#1e3a5f] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>

            @if (d.avaliacoes.length > 0) {
              <!-- Progresso -->
              <div class="mb-3">
                <div class="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{{ getConcluidas(d.id) }}/{{ d.avaliacoes.length }} avaliações</span>
                  <span class="font-medium" [style.color]="d.cor">{{ getProgresso(d.id) }}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full transition-all"
                    [style.width.%]="getProgresso(d.id)"
                    [style.background-color]="d.cor"
                  ></div>
                </div>
              </div>

              <!-- Stats -->
              <div class="flex gap-3 text-xs">
                <div class="flex items-center gap-1 text-slate-500">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <span>{{ d.avaliacoes.length }} avaliações</span>
                </div>
                <div class="flex items-center gap-1 text-slate-500">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span>{{ getTotalPontos(d.id) }} pts totais</span>
                </div>
                @let prox = getProxima(d.id);
                @if (prox) {
                  <div class="flex items-center gap-1 text-rose-500 ml-auto">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{{ prox.dataDisplay }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-xs text-slate-400 italic">Sem avaliações cadastradas</p>
            }
          </a>
        }
      </div>

    </div>
  `,
})
export class DisciplinasComponent {
  private sheets = inject(SheetsService);
  get disciplinas() { return this.sheets.disciplinas(); }
  filtro = signal<'todas' | 'com-avaliacoes'>('com-avaliacoes');

  constructor(public storage: StorageService) {}

  disciplinasFiltradas() {
    if (this.filtro() === 'com-avaliacoes') {
      return this.disciplinas.filter(d => d.avaliacoes.length > 0);
    }
    return this.disciplinas;
  }

  getConcluidas(id: string): number {
    const d = this.disciplinas.find(d => d.id === id);
    return d?.avaliacoes.filter(a => this.storage.isConcluida(a.id)).length ?? 0;
  }

  getProgresso(id: string): number {
    const d = this.disciplinas.find(d => d.id === id);
    if (!d || d.avaliacoes.length === 0) return 0;
    return Math.round((this.getConcluidas(id) / d.avaliacoes.length) * 100);
  }

  getTotalPontos(id: string): number {
    return this.disciplinas.find(d => d.id === id)?.avaliacoes.reduce((s, a) => s + a.pontos, 0) ?? 0;
  }

  getProxima(id: string) {
    const hoje = new Date();
    return this.disciplinas.find(d => d.id === id)?.avaliacoes
      .filter(a => a.data && !this.storage.isConcluida(a.id) && new Date(a.data) >= hoje)
      .sort((a, b) => new Date(a.data!).getTime() - new Date(b.data!).getTime())[0] ?? null;
  }
}
