import { Injectable, NgZone, computed, effect, inject, signal } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { Avaliacao } from '../models/models';
import { AuthService } from './auth.service';
import { PeriodosService } from './periodos.service';

@Injectable({ providedIn: 'root' })
export class AvaliacoesService {
  private authService = inject(AuthService);
  private periodosService = inject(PeriodosService);
  private ngZone = inject(NgZone);

  private readonly periodoOverride = signal<string | null>(null);

  /** Por padrão, o período em curso da turma do usuário logado — pode ser trocado pelo admin com setPeriodo(). */
  readonly periodoId = computed(() => {
    if (this.periodoOverride()) return this.periodoOverride();
    const turmaId = this.authService.perfil()?.turmaId;
    if (!turmaId) return null;
    return this.periodosService.ativoDaTurma(turmaId)?.id ?? null;
  });

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  private readonly _avaliacoes = signal<Avaliacao[]>([]);
  readonly avaliacoes = computed(() => this._avaliacoes());

  private unsub: (() => void) | null = null;

  constructor() {
    effect(() => {
      const periodoId = this.periodoId();
      this.unsub?.();
      this.unsub = null;
      this._avaliacoes.set([]);

      if (!periodoId) {
        this.carregando.set(false);
        return;
      }

      this.carregando.set(true);
      const q = query(collection(db, 'avaliacoes'), where('periodoId', '==', periodoId));
      this.unsub = onSnapshot(
        q,
        snap => this.ngZone.run(() => {
          this._avaliacoes.set(snap.docs.map(d => ({ id: d.id, ...d.data() } as Avaliacao)));
          this.carregando.set(false);
        }),
        err => this.ngZone.run(() => {
          this.erro.set(err.message);
          this.carregando.set(false);
        })
      );
    });
  }

  /** Permite ao admin visualizar/gerenciar avaliações de um período diferente do período ativo da sua turma. */
  setPeriodo(periodoId: string | null): void {
    this.periodoOverride.set(periodoId);
  }

  porDisciplina(disciplinaId: string): Avaliacao[] {
    return this.avaliacoes().filter(a => a.disciplinaId === disciplinaId);
  }

  async criar(dados: Omit<Avaliacao, 'id'>): Promise<void> {
    await addDoc(collection(db, 'avaliacoes'), dados);
  }

  async atualizar(id: string, dados: Partial<Omit<Avaliacao, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'avaliacoes', id), dados);
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'avaliacoes', id));
  }
}
