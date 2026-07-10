import { Injectable, NgZone, computed, signal } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Turma } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TurmasService {
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  private readonly _turmas = signal<Turma[]>([]);

  readonly turmas = computed(() =>
    [...this._turmas()].sort((a, b) => a.nome.localeCompare(b.nome))
  );
  readonly turmasAtivas = computed(() => this.turmas().filter(t => t.ativa));

  constructor(private ngZone: NgZone) {
    onSnapshot(
      collection(db, 'turmas'),
      snap => this.ngZone.run(() => {
        this._turmas.set(snap.docs.map(d => ({ id: d.id, ...d.data() } as Turma)));
        this.carregando.set(false);
      }),
      err => this.ngZone.run(() => {
        this.erro.set(err.message);
        this.carregando.set(false);
      })
    );
  }

  getNome(turmaId: string): string {
    return this.turmas().find(t => t.id === turmaId)?.nome ?? '';
  }

  async criar(dados: Omit<Turma, 'id' | 'criadoEm'>): Promise<void> {
    await addDoc(collection(db, 'turmas'), { ...dados, criadoEm: serverTimestamp() });
  }

  async atualizar(id: string, dados: Partial<Omit<Turma, 'id' | 'criadoEm'>>): Promise<void> {
    await updateDoc(doc(db, 'turmas', id), dados);
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'turmas', id));
  }
}
