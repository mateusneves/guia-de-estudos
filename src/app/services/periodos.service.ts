import { Injectable, NgZone, computed, effect, inject, signal } from '@angular/core';
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
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PeriodosService {
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  private readonly _periodos = signal<Periodo[]>([]);

  readonly periodos = computed(() =>
    [...this._periodos()].sort((a, b) => b.anoSemestre.localeCompare(a.anoSemestre))
  );

  private unsub: (() => void) | null = null;

  constructor() {
    // Mesma razão do TurmasService: este serviço existe desde antes do login
    // (injetado pelo App root), então a assinatura precisa reagir a logado()
    // e se refazer quando ele mudar — senão fica morta (erro de permissão) se
    // o primeiro attempt aconteceu antes do usuário estar autenticado.
    effect(() => {
      const logado = this.authService.logado();
      this.unsub?.();
      this.unsub = null;
      this._periodos.set([]);

      if (!logado) {
        this.carregando.set(false);
        return;
      }

      this.carregando.set(true);
      this.unsub = onSnapshot(
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
    });
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
