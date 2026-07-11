import { Injectable, computed, effect, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { TurmasService } from './turmas.service';
import { temaPorId } from '../shared/temas-catalogo';

/**
 * Aplica o tema visual da turma do usuário logado escrevendo `data-tema="<id>"` em
 * `<html>` — todo o resto é CSS puro (`src/styles.css`), nenhum componente lê este
 * serviço para se estilizar. Cai em "padrao" pré-login (sem perfil ainda) e para
 * qualquer turma sem `temaId`/com um id desconhecido (ver `temaPorId`).
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  private authService = inject(AuthService);
  private turmasService = inject(TurmasService);

  readonly temaAtivo = computed(() => {
    const turmaId = this.authService.perfil()?.turmaId;
    const turma = turmaId ? this.turmasService.turmas().find(t => t.id === turmaId) : undefined;
    return temaPorId(turma?.temaId);
  });

  constructor() {
    effect(() => {
      const tema = this.temaAtivo();
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-tema', tema.id);
      }
    });
  }
}
