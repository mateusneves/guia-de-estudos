import { Injectable, NgZone, computed, effect, inject, signal } from '@angular/core';
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
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TurmasService {
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  private readonly _turmas = signal<Turma[]>([]);

  readonly turmas = computed(() =>
    [...this._turmas()].sort((a, b) => a.nome.localeCompare(b.nome))
  );
  readonly turmasAtivas = computed(() => this.turmas().filter(t => t.ativa));

  private unsub: (() => void) | null = null;

  constructor() {
    // Este serviço é instanciado pelo App root, ou seja, existe mesmo antes do
    // login (nas telas de /login e /cadastro). Um onSnapshot só pode ler "turmas"
    // com o usuário autenticado (ver firestore.rules) — se assinado antes do login,
    // a assinatura morre com erro de permissão e (diferente de um efeito reativo)
    // nunca se reconecta sozinha depois que o usuário loga. Por isso a assinatura
    // aqui reage a logado() e se refaz sempre que esse valor muda.
    effect(() => {
      const logado = this.authService.logado();
      this.unsub?.();
      this.unsub = null;
      this._turmas.set([]);

      if (!logado) {
        this.carregando.set(false);
        return;
      }

      this.carregando.set(true);
      this.unsub = onSnapshot(
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
    });
  }

  getNome(turmaId: string): string {
    return this.turmas().find(t => t.id === turmaId)?.nome ?? '';
  }

  async criar(dados: Omit<Turma, 'id' | 'criadoEm'>): Promise<string> {
    const ref = await addDoc(collection(db, 'turmas'), { ...dados, criadoEm: serverTimestamp() });
    return ref.id;
  }

  async atualizar(id: string, dados: Partial<Omit<Turma, 'id' | 'criadoEm'>>): Promise<void> {
    await updateDoc(doc(db, 'turmas', id), dados);
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'turmas', id));
  }
}
