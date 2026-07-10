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
import { PeriodosService } from './periodos.service';

@Injectable({ providedIn: 'root' })
export class DisciplinasService {
  private authService = inject(AuthService);
  private avaliacoesService = inject(AvaliacoesService);
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
  private readonly _disciplinas = signal<Omit<Disciplina, 'avaliacoes'>[]>([]);

  /** Disciplinas do período atual, já com as avaliações de cada uma embutidas — mesmo formato usado pelas páginas. */
  readonly disciplinas = computed<Disciplina[]>(() => {
    const avaliacoes = this.avaliacoesService.avaliacoes();
    return this._disciplinas()
      .map(d => ({ ...d, avaliacoes: avaliacoes.filter(a => a.disciplinaId === d.id) }))
      .sort((a, b) => a.codigo.localeCompare(b.codigo));
  });

  private unsub: (() => void) | null = null;

  constructor() {
    effect(() => {
      const periodoId = this.periodoId();
      this.unsub?.();
      this.unsub = null;
      this._disciplinas.set([]);

      if (!periodoId) {
        this.carregando.set(false);
        return;
      }

      this.carregando.set(true);
      const q = query(collection(db, 'disciplinas'), where('periodoId', '==', periodoId));
      this.unsub = onSnapshot(
        q,
        snap => this.ngZone.run(() => {
          this._disciplinas.set(snap.docs.map(d => this.normalizar({ id: d.id, ...d.data() })));
          this.carregando.set(false);
        }),
        err => this.ngZone.run(() => {
          this.erro.set(err.message);
          this.carregando.set(false);
        })
      );
    });
  }

  /** Disciplinas criadas antes de conteudoProgramatico virar texto livre guardaram um array de {unidade, descricao} — reconcilia isso para as páginas nunca verem outra coisa que não string. */
  private normalizar(dados: Record<string, unknown>): Omit<Disciplina, 'avaliacoes'> {
    const conteudo = dados['conteudoProgramatico'];
    if (Array.isArray(conteudo)) {
      dados = {
        ...dados,
        conteudoProgramatico: conteudo
          .map((c: { unidade?: string; descricao?: string }) => [c.unidade, c.descricao].filter(Boolean).join(': '))
          .join('\n'),
      };
    }
    return dados as unknown as Omit<Disciplina, 'avaliacoes'>;
  }

  /** Permite ao admin visualizar/gerenciar disciplinas de um período diferente do período ativo da sua turma. */
  setPeriodo(periodoId: string | null): void {
    this.periodoOverride.set(periodoId);
    this.avaliacoesService.setPeriodo(periodoId);
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
