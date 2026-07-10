import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DisciplinasService } from '../../services/disciplinas.service';

interface AulaDoDia {
  dia: string;
  modulo: string;
  horario: string;
  disciplinaId: string;
  disciplina: string;
}

@Component({
  selector: 'app-horario',
  imports: [RouterLink],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Horário Semanal</h1>
        <p class="text-slate-500 text-sm mt-1">3º Ano — 1º Semestre 2026</p>
      </div>

      <!-- Legenda de módulos -->
      <div class="card">
        <h3 class="text-sm font-semibold text-slate-700 mb-3">Módulos de Aula</h3>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold">M1</span>
            <span class="text-sm text-slate-600">07:00 às 08:40</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded bg-[#2d5a8e] flex items-center justify-center text-white text-xs font-bold">M2</span>
            <span class="text-sm text-slate-600">08:50 às 10:30</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded bg-[#0f766e] flex items-center justify-center text-white text-xs font-bold">M3</span>
            <span class="text-sm text-slate-600">10:40 às 12:20</span>
          </div>
        </div>
      </div>

      <!-- Grade semanal desktop -->
      <div class="hidden md:block card overflow-hidden p-0">
        <div class="grid" style="grid-template-columns: 100px repeat(5, 1fr);">
          <!-- Header -->
          <div class="bg-slate-50 p-3 border-b border-r border-slate-100"></div>
          @for (dia of dias; track dia) {
            <div
              class="p-3 text-center font-semibold text-sm border-b border-r border-slate-100 last:border-r-0"
              [class.bg-[#1e3a5f]]="isHoje(dia)"
              [class.text-white]="isHoje(dia)"
              [class.bg-slate-50]="!isHoje(dia)"
              [class.text-slate-700]="!isHoje(dia)"
            >
              {{ dia }}
              @if (isHoje(dia)) {
                <span class="ml-1 text-xs text-[#c9a84c]">●</span>
              }
            </div>
          }

          <!-- Módulos -->
          @for (modulo of modulos; track modulo.key) {
            <div class="bg-slate-50 p-3 border-b border-r border-slate-100 last:border-b-0 flex flex-col justify-center">
              <p class="font-bold text-slate-600 text-xs">{{ modulo.key }}</p>
              <p class="text-slate-400 text-xs leading-tight">{{ modulo.horario }}</p>
            </div>
            @for (dia of dias; track dia) {
              <div class="p-2 border-b border-r border-slate-100 last:border-r-0 last:border-b-0">
                @let aula = getAula(dia, modulo.key);
                @if (aula) {
                  <a
                    [routerLink]="['/disciplinas', aula.disciplinaId]"
                    class="flex flex-col h-full p-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    [style.background-color]="getCorDisciplina(aula.disciplinaId) + '22'"
                    [style.border-left]="'3px solid ' + getCorDisciplina(aula.disciplinaId)"
                  >
                    <span class="text-xs font-mono font-semibold" [style.color]="getCorDisciplina(aula.disciplinaId)">
                      {{ getCodigo(aula.disciplinaId) }}
                    </span>
                    <span class="text-xs text-slate-700 mt-0.5 leading-snug">{{ getNomeCurto(aula.disciplina) }}</span>
                  </a>
                } @else {
                  <div class="h-full min-h-12 flex items-center justify-center">
                    <span class="text-slate-200 text-xs">—</span>
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>

      <!-- Grade semanal mobile (cards por dia) -->
      <div class="md:hidden space-y-4">
        @for (dia of dias; track dia) {
          <div class="card" [class.ring-2]="isHoje(dia)" [class.ring-[#1e3a5f]]="isHoje(dia)">
            <div class="flex items-center gap-2 mb-3">
              <h3 class="font-semibold text-slate-800">{{ dia }}</h3>
              @if (isHoje(dia)) {
                <span class="badge bg-[#1e3a5f] text-white">Hoje</span>
              }
            </div>
            @let aulasdia = getAulasDia(dia);
            @if (aulasdia.length > 0) {
              <div class="space-y-2">
                @for (aula of aulasdia; track aula.horario) {
                  <a
                    [routerLink]="['/disciplinas', aula.disciplinaId]"
                    class="flex items-center gap-3 p-3 rounded-lg hover:opacity-90 transition-opacity"
                    [style.background-color]="getCorDisciplina(aula.disciplinaId) + '15'"
                    [style.border-left]="'3px solid ' + getCorDisciplina(aula.disciplinaId)"
                  >
                    <div class="min-w-0">
                      <p class="text-xs font-mono font-bold" [style.color]="getCorDisciplina(aula.disciplinaId)">{{ aula.modulo }} · {{ aula.horario }}</p>
                      <p class="text-sm text-slate-800">{{ getNomeCurto(aula.disciplina) }}</p>
                    </div>
                  </a>
                }
              </div>
            } @else {
              <p class="text-sm text-slate-400 text-center py-3">Sem aulas</p>
            }
          </div>
        }
      </div>

      <!-- Lista completa das disciplinas no horário -->
      <div class="card">
        <h2 class="font-semibold text-slate-800 mb-4">Disciplinas no Horário</h2>
        <div class="space-y-2">
          @for (item of listaHorario; track item.disciplinaId) {
            <div class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div class="flex items-center gap-3">
                <span
                  class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-xs font-bold shrink-0"
                  [style.background-color]="getCorDisciplina(item.disciplinaId)"
                >{{ getCodigo(item.disciplinaId).substring(0, 2) }}</span>
                <div>
                  <p class="text-sm font-medium text-slate-800">{{ getNomeCurto(item.disciplina) }}</p>
                  <p class="text-xs text-slate-400 font-mono">{{ item.disciplinaId.toUpperCase() }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-600 font-medium">{{ item.dia }}</p>
                <p class="text-xs text-slate-400">{{ item.modulo }} · {{ item.horario }}</p>
              </div>
            </div>
          }
        </div>
      </div>

    </div>
  `,
})
export class HorarioComponent {
  private disciplinasService = inject(DisciplinasService);
  get disciplinas() { return this.disciplinasService.disciplinas(); }

  dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

  modulos = [
    { key: 'M1', horario: '07:00–08:40' },
    { key: 'M2', horario: '08:50–10:30' },
    { key: 'M3', horario: '10:40–12:20' },
  ];

  diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  private get todasAulas(): AulaDoDia[] {
    return this.disciplinas.flatMap(d =>
      d.horarios.map(h => ({ ...h, disciplinaId: d.id, disciplina: d.nomeCompleto }))
    );
  }

  isHoje(dia: string): boolean {
    return this.diasSemana[new Date().getDay()] === dia;
  }

  getAula(dia: string, modulo: string): AulaDoDia | undefined {
    return this.todasAulas.find(a => a.dia === dia && a.modulo === modulo);
  }

  getAulasDia(dia: string): AulaDoDia[] {
    return this.todasAulas.filter(a => a.dia === dia);
  }

  get listaHorario(): AulaDoDia[] {
    return this.todasAulas;
  }

  getCorDisciplina(id: string): string {
    return this.disciplinas.find(d => d.id === id)?.cor ?? '#64748b';
  }

  getCodigo(id: string): string {
    return this.disciplinas.find(d => d.id === id)?.codigo ?? id.toUpperCase();
  }

  getNomeCurto(nome: string): string {
    return nome.replace(/^[A-Z0-9]+ - /, '');
  }
}
