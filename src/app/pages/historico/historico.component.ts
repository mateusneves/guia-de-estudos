import { Component, inject } from '@angular/core';
import { HistoricoService } from '../../services/historico.service';
import { NIVEIS, SELOS } from '../../shared/gamificacao-catalogo';
import { EventoXp } from '../../models/models';

const PREFIXO_SELO = 'Conquista desbloqueada: ';
const PREFIXO_NIVEL = 'Novo nível alcançado: ';
const ICONE_PADRAO = { icone: 'fa-solid fa-star', cor: '#eab308' };

@Component({
  selector: 'app-historico',
  imports: [],
  template: `
    <div class="p-4 md:p-6 max-w-4xl mx-auto space-y-6">

      <div>
        <h1 class="text-2xl font-bold text-[var(--cor-texto-principal)]">Histórico de XP</h1>
        <p class="text-[var(--cor-texto-secundario)] text-sm mt-1">Todo ponto de XP que você já ganhou (ou perdeu), toda conquista desbloqueada e toda mudança de nível — seu XP é vitalício, então este histórico também é.</p>
      </div>

      <div class="card">
        @if (historico.eventos().length === 0) {
          <div class="flex flex-col items-center justify-center py-10 text-center">
            <svg class="w-10 h-10 text-[var(--cor-texto-terciario)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-[var(--cor-texto-terciario)]">Nenhum evento ainda — conclua uma atividade para começar a ganhar XP!</p>
          </div>
        } @else {
          <div class="divide-y divide-[var(--cor-borda-sutil)]">
            @for (ev of historico.eventos(); track ev.id) {
              <div class="flex items-center justify-between py-3 gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  @if (ev.delta === 0) {
                    <span class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" [style.background-color]="iconePara(ev).cor">
                      <i [class]="iconePara(ev).icone + ' text-white text-sm'"></i>
                    </span>
                  }
                  <div class="min-w-0">
                    <p class="text-sm text-[var(--cor-texto-principal)] truncate">{{ ev.motivo }}</p>
                    <p class="text-xs text-[var(--cor-texto-terciario)]">{{ formatarData(ev.data) }}</p>
                  </div>
                </div>
                @if (ev.delta !== 0) {
                  <span
                    class="text-sm font-semibold shrink-0"
                    [class.text-emerald-600]="ev.delta > 0"
                    [class.text-rose-500]="ev.delta < 0"
                  >{{ ev.delta > 0 ? '+' : '' }}{{ ev.delta }} XP</span>
                }
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

  // Entradas com delta 0 (conquista desbloqueada / nível alcançado) não carregam o id do
  // selo/nível no ledger, só o `motivo` já formatado por GamificacaoService — resolve o
  // ícone/cor reais a partir do título embutido nesse texto (título é único em cada
  // catálogo, ver gamificacao-catalogo.ts), em vez do badge genérico usado antes, que
  // fazia toda conquista parecer a mesma no Histórico mesmo já sendo distinta na Dashboard.
  iconePara(ev: EventoXp): { icone: string; cor: string } {
    if (ev.motivo.startsWith(PREFIXO_SELO)) {
      const titulo = ev.motivo.slice(PREFIXO_SELO.length);
      const selo = SELOS.find(s => s.titulo === titulo);
      if (selo) return { icone: selo.icone, cor: selo.cor };
    } else if (ev.motivo.startsWith(PREFIXO_NIVEL)) {
      const titulo = ev.motivo.slice(PREFIXO_NIVEL.length);
      const nivel = NIVEIS.find(n => n.titulo === titulo);
      if (nivel) return { icone: nivel.icone, cor: nivel.cor };
    }
    return ICONE_PADRAO;
  }
}
