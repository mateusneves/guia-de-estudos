import { Injectable, NgZone, computed, signal } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Periodo } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PeriodosService {
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  private readonly _periodos = signal<Periodo[]>([]);

  readonly periodos = computed(() =>
    [...this._periodos()].sort((a, b) => b.anoSemestre.localeCompare(a.anoSemestre))
  );

  constructor(private ngZone: NgZone) {
    onSnapshot(
      collection(db, 'periodos'),
      snap => this.ngZone.run(() => {
        this._periodos.set(snap.docs.map(d => ({ id: d.id, ...d.data() } as Periodo)));
        this.carregando.set(false);
      }),
      err => this.ngZone.run(() => {
        this.erro.set(err.message);
        this.carregando.set(false);
      })
    );
  }

  porTurma(turmaId: string): Periodo[] {
    return this.periodos().filter(p => p.turmaId === turmaId);
  }

  /** O período em curso de uma turma — é ele que define quais disciplinas/atividades os alunos veem. */
  ativoDaTurma(turmaId: string): Periodo | null {
    return this.periodos().find(p => p.turmaId === turmaId && p.ativo) ?? null;
  }

  async criar(dados: Omit<Periodo, 'id' | 'criadoEm'>): Promise<void> {
    await addDoc(collection(db, 'periodos'), { ...dados, criadoEm: serverTimestamp() });
  }

  async atualizar(id: string, dados: Partial<Omit<Periodo, 'id' | 'criadoEm'>>): Promise<void> {
    await updateDoc(doc(db, 'periodos', id), dados);
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'periodos', id));
  }

  /** Ativa um período e desativa os demais da mesma turma — só um período pode estar em curso por vez. */
  async ativar(turmaId: string, periodoId: string): Promise<void> {
    const batch = writeBatch(db);
    for (const p of this.porTurma(turmaId)) {
      if (p.ativo && p.id !== periodoId) {
        batch.update(doc(db, 'periodos', p.id), { ativo: false });
      }
    }
    batch.update(doc(db, 'periodos', periodoId), { ativo: true });
    await batch.commit();
  }
}
