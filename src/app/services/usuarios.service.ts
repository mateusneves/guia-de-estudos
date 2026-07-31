import { Injectable, NgZone, computed, signal } from '@angular/core';
import { collection, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Progresso, Usuario } from '../models/models';

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

  /**
   * Backfill administrativo de `usuarios/{uid}.xp` a partir de `progresso/{uid}.xp` —
   * ação sob demanda, não algo que roda sozinho. `ProgressoService` já mantém esse espelho
   * sincronizado daqui pra frente (a cada grant de XP, e também ao carregar o próprio
   * progresso de cada usuário), mas isso só se resolve sozinho quando CADA aluno loga de
   * novo — contas que já tinham XP acumulado antes do espelho existir e ainda não voltaram
   * a logar ficam com `xp` desatualizado no ranking até lá. Só admin consegue rodar isso:
   * lê `progresso/{uid}` de qualquer usuário (regra permite self ou admin) e grava em
   * `usuarios/{uid}` (regra de admin permite update irrestrito). Retorna quantos precisaram
   * de correção, pra dar feedback na UI.
   */
  async sincronizarXp(): Promise<number> {
    let atualizados = 0;
    for (const u of this.usuarios()) {
      const progressoSnap = await getDoc(doc(db, 'progresso', u.uid));
      if (!progressoSnap.exists()) continue;
      const xpReal = (progressoSnap.data() as Progresso).xp ?? 0;
      if (xpReal !== (u.xp ?? 0)) {
        await updateDoc(doc(db, 'usuarios', u.uid), { xp: xpReal });
        atualizados++;
      }
    }
    return atualizados;
  }
}
