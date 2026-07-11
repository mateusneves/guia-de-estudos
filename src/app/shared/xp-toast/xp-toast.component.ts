import { Component, inject } from '@angular/core';
import { GamificacaoService } from '../../services/gamificacao.service';

/** Toasts de "+X XP"/"-X XP" — alimentado por `GamificacaoService.notificacoes`, renderizado globalmente em `app.ts`. */
@Component({
  selector: 'app-xp-toast',
  imports: [],
  template: `
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      @for (n of gamificacao.notificacoes(); track n.id) {
        <div
          class="pointer-events-auto px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white max-w-xs"
          [class.bg-emerald-600]="n.delta >= 0"
          [class.bg-rose-600]="n.delta < 0"
        >{{ n.texto }}</div>
      }
    </div>
  `,
})
export class XpToastComponent {
  gamificacao = inject(GamificacaoService);
}
