import { Component, inject } from '@angular/core';
import { HistoricoService } from '../../services/historico.service';

@Component({
  selector: 'app-historico',
  imports: [],
  template: `
    <div class="p-4 md:p-6 max-w-4xl mx-auto space-y-6">

      <div>
        <h1 class="text-2xl font-bold text-slate-800">Histórico de XP</h1>
        <p class="text-slate-500 text-sm mt-1">Todo ponto de XP que você já ganhou (ou perdeu), com o motivo — seu XP é vitalício, então este histórico também é.</p>
      </div>

      <div class="card">
        @if (historico.eventos().length === 0) {
          <div class="flex flex-col items-center justify-center py-10 text-center">
            <svg class="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-slate-400">Nenhum evento ainda — conclua uma atividade para começar a ganhar XP!</p>
          </div>
        } @else {
          <div class="divide-y divide-slate-100">
            @for (ev of historico.eventos(); track ev.id) {
              <div class="flex items-center justify-between py-3 gap-3">
                <div class="min-w-0">
                  <p class="text-sm text-slate-800 truncate">{{ ev.motivo }}</p>
                  <p class="text-xs text-slate-400">{{ formatarData(ev.data) }}</p>
                </div>
                <span
                  class="text-sm font-semibold shrink-0"
                  [class.text-emerald-600]="ev.delta >= 0"
                  [class.text-rose-500]="ev.delta < 0"
                >{{ ev.delta >= 0 ? '+' : '' }}{{ ev.delta }} XP</span>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `,
})
export class HistoricoComponent {
  historico = inject(HistoricoService);

  formatarData(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
