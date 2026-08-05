import { Injectable, NgZone, computed, effect, inject, signal } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { Aviso } from '../models/models';
import { AuthService } from './auth.service';

/** Quadro de avisos (/avisos) — escopado pela turma do usuário logado, como
 * disciplinas/avaliações. Leitura liberada a qualquer autenticado da mesma turma;
 * criar/excluir só admin (ver firestore.rules). */
@Injectable({ providedIn: 'root' })
export class AvisosService {
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  private readonly _avisos = signal<Aviso[]>([]);

  /** Mais recente primeiro. */
  readonly avisos = computed(() =>
    [...this._avisos()].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
  );

  private unsub: (() => void) | null = null;

  constructor() {
    effect(() => {
      const turmaId = this.authService.perfil()?.turmaId ?? null;
      this.unsub?.();
      this.unsub = null;
      this._avisos.set([]);

      if (!turmaId) {
        this.carregando.set(false);
        return;
      }

      this.carregando.set(true);
      const q = query(collection(db, 'avisos'), where('turmaId', '==', turmaId));
      this.unsub = onSnapshot(
        q,
        snap => this.ngZone.run(() => {
          this._avisos.set(snap.docs.map(d => ({ id: d.id, ...d.data() } as Aviso)));
          this.carregando.set(false);
        }),
        err => this.ngZone.run(() => {
          this.erro.set(err.message);
          this.carregando.set(false);
        })
      );
    });
  }

  async criar(titulo: string, mensagem: string): Promise<void> {
    const perfil = this.authService.perfil();
    if (!perfil) return;
    const dados: Omit<Aviso, 'id'> = {
      turmaId: perfil.turmaId,
      titulo,
      mensagem,
      autorNome: perfil.nome,
      criadoEm: new Date().toISOString(),
    };
    await addDoc(collection(db, 'avisos'), dados);
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'avisos', id));
  }
}
