import { Injectable, NgZone, computed, signal } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ModuloHorario } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ModulosHorarioService {
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  private readonly _modulos = signal<ModuloHorario[]>([]);

  readonly modulos = computed(() =>
    [...this._modulos()].sort((a, b) => a.codigo.localeCompare(b.codigo))
  );

  constructor(private ngZone: NgZone) {
    onSnapshot(
      collection(db, 'modulos_horario'),
      snap => this.ngZone.run(() => {
        this._modulos.set(snap.docs.map(d => ({ id: d.id, ...d.data() } as ModuloHorario)));
        this.carregando.set(false);
      }),
      err => this.ngZone.run(() => {
        this.erro.set(err.message);
        this.carregando.set(false);
      })
    );
  }

  porTurma(turmaId: string): ModuloHorario[] {
    return this.modulos().filter(m => m.turmaId === turmaId);
  }

  async criar(dados: Omit<ModuloHorario, 'id'>): Promise<void> {
    await addDoc(collection(db, 'modulos_horario'), dados);
  }

  async atualizar(id: string, dados: Partial<Omit<ModuloHorario, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'modulos_horario', id), dados);
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'modulos_horario', id));
  }
}
