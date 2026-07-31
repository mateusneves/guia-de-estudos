import { Injectable, NgZone, computed, effect, inject, signal } from '@angular/core';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { AuthService } from './auth.service';
import { Usuario } from '../models/models';

/**
 * Ranking de XP da turma do usuário logado. Só é construído quando a página /ranking
 * carrega (não é injetado eagerly pelo App root), então não precisa do padrão
 * `logado()`-gated effect documentado em CLAUDE.md para TurmasService/PeriodosService —
 * como DisciplinasService/UsuariosService, é seguro porque authGuard já garantiu login
 * antes da rota ativar este serviço.
 *
 * A query filtra só por `turmaId` (sem orderBy no Firestore, para não exigir um índice
 * composto que teria que ser criado manualmente) — a ordenação por XP acontece em
 * memória no `ranking` computed, igual ao padrão já usado em PeriodosService/TurmasService
 * de carregar e ordenar/filtrar localmente.
 */
@Injectable({ providedIn: 'root' })
export class RankingService {
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  private readonly _usuarios = signal<Usuario[]>([]);

  readonly ranking = computed(() =>
    this._usuarios()
      .filter(u => u.ativo)
      .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))
  );

  private unsub: (() => void) | null = null;

  constructor() {
    effect(() => {
      const turmaId = this.authService.perfil()?.turmaId ?? null;
      this.unsub?.();
      this.unsub = null;
      this._usuarios.set([]);
      if (!turmaId) return;

      this.carregando.set(true);
      this.unsub = onSnapshot(
        query(collection(db, 'usuarios'), where('turmaId', '==', turmaId)),
        snap => this.ngZone.run(() => {
          this._usuarios.set(snap.docs.map(d => d.data() as Usuario));
          this.carregando.set(false);
        }),
        err => this.ngZone.run(() => {
          this.erro.set(err.message);
          this.carregando.set(false);
        })
      );
    });
  }
}
