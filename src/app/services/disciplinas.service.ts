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
import { Disciplina } from '../models/models';
import { AuthService } from './auth.service';
import { AvaliacoesService } from './avaliacoes.service';

@Injectable({ providedIn: 'root' })
export class DisciplinasService {
  private authService = inject(AuthService);
  private avaliacoesService = inject(AvaliacoesService);
  private ngZone = inject(NgZone);

  private readonly turmaOverride = signal<string | null>(null);
  readonly turmaId = computed(() => this.turmaOverride() ?? this.authService.perfil()?.turmaId ?? null);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  private readonly _disciplinas = signal<Omit<Disciplina, 'avaliacoes'>[]>([]);

  /** Disciplinas da turma atual, já com as avaliações de cada uma embutidas — mesmo formato usado pelas páginas. */
  readonly disciplinas = computed<Disciplina[]>(() => {
    const avaliacoes = this.avaliacoesService.avaliacoes();
    return this._disciplinas()
      .map(d => ({ ...d, avaliacoes: avaliacoes.filter(a => a.disciplinaId === d.id) }))
      .sort((a, b) => a.codigo.localeCompare(b.codigo));
  });

  private unsub: (() => void) | null = null;

  constructor() {
    effect(() => {
      const turmaId = this.turmaId();
      this.unsub?.();
      this.unsub = null;
      this._disciplinas.set([]);

      if (!turmaId) {
        this.carregando.set(false);
        return;
      }

      this.carregando.set(true);
      const q = query(collection(db, 'disciplinas'), where('turmaId', '==', turmaId));
      this.unsub = onSnapshot(
        q,
        snap => this.ngZone.run(() => {
          this._disciplinas.set(snap.docs.map(d => ({ id: d.id, ...d.data() } as Omit<Disciplina, 'avaliacoes'>)));
          this.carregando.set(false);
        }),
        err => this.ngZone.run(() => {
          this.erro.set(err.message);
          this.carregando.set(false);
        })
      );
    });
  }

  /** Permite ao admin visualizar/gerenciar disciplinas de uma turma diferente da sua própria. */
  setTurma(turmaId: string | null): void {
    this.turmaOverride.set(turmaId);
    this.avaliacoesService.setTurma(turmaId);
  }

  async criar(dados: Omit<Disciplina, 'id' | 'avaliacoes'>): Promise<void> {
    await addDoc(collection(db, 'disciplinas'), dados);
  }

  async atualizar(id: string, dados: Partial<Omit<Disciplina, 'id' | 'avaliacoes'>>): Promise<void> {
    await updateDoc(doc(db, 'disciplinas', id), dados);
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'disciplinas', id));
  }
}
