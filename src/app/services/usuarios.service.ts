import { Injectable, NgZone, computed, signal } from '@angular/core';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Usuario } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  private readonly _usuarios = signal<Usuario[]>([]);

  readonly usuarios = computed(() =>
    [...this._usuarios()].sort((a, b) => a.nome.localeCompare(b.nome))
  );

  constructor(private ngZone: NgZone) {
    onSnapshot(
      collection(db, 'usuarios'),
      snap => this.ngZone.run(() => {
        this._usuarios.set(snap.docs.map(d => d.data() as Usuario));
        this.carregando.set(false);
      }),
      err => this.ngZone.run(() => {
        this.erro.set(err.message);
        this.carregando.set(false);
      })
    );
  }

  /** "Excluir" um usuário desativa o acesso dele ao app (a conta de autenticação em si não é removida). */
  async atualizar(uid: string, dados: Partial<Pick<Usuario, 'nome' | 'role' | 'turmaId' | 'ativo'>>): Promise<void> {
    await updateDoc(doc(db, 'usuarios', uid), dados);
  }
}
