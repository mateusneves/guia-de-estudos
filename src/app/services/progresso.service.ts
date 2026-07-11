import { Injectable, NgZone, computed, effect, inject, signal } from '@angular/core';
import { addDoc, arrayRemove, arrayUnion, collection, doc, increment, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { AuthService } from './auth.service';
import { Progresso } from '../models/models';

const LEGACY_STORAGE_KEY = 'guia-estudos-conclusoes';
const LEGACY_NOTAS_KEY = 'guia-estudos-notas';

interface Backup {
  versao: number;
  exportadoEm: string;
  conclusoes: string[];
  notas: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class ProgressoService {
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);

  private readonly _progresso = signal<Progresso>({ concluidas: [], notas: {}, xp: 0, ultimoDiaXp: null });
  private unsub: (() => void) | null = null;

  // equal por conteúdo: snap.data() cria um array novo em toda leitura do Firestore,
  // mesmo quando só "xp" mudou — sem isso, GamificacaoService (que lê `concluidas()`
  // dentro do efeito que também escreve `xp`) reentra em loop: grava XP → concluidas()
  // "muda" de referência → reavalia progresso → grava XP de novo, sem parar.
  readonly concluidas = computed(() => this._progresso().concluidas, {
    equal: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]),
  });
  readonly xp = computed(() => this._progresso().xp);
  readonly ultimoDiaXp = computed(() => this._progresso().ultimoDiaXp);

  // false enquanto o valor acima é só o placeholder local (logout, ou login recém-feito
  // mas o onSnapshot real ainda não respondeu) — NUNCA reflete o Firestore de verdade
  // até isto virar true. GamificacaoService depende disto para não tratar esse
  // placeholder transitório como "usuário desmarcou tudo"/"ainda não logou hoje" (ver
  // CLAUDE.md "Gamificação" — foi exatamente essa confusão que causou XP negativo
  // e XP de login duplicado no mesmo dia logo após um logout+login).
  private readonly _carregado = signal(false);
  readonly carregado = this._carregado.asReadonly();

  constructor() {
    effect(() => {
      const uid = this.authService.usuario()?.uid ?? null;
      this.unsub?.();
      this.unsub = null;
      this._progresso.set({ concluidas: [], notas: {}, xp: 0, ultimoDiaXp: null });
      this._carregado.set(false);
      if (!uid) return;

      this.unsub = onSnapshot(doc(db, 'progresso', uid), snap => this.ngZone.run(() => {
        if (snap.exists()) {
          const dados = snap.data() as Progresso;
          this._progresso.set({
            concluidas: dados.concluidas ?? [],
            notas: dados.notas ?? {},
            xp: dados.xp ?? 0,
            ultimoDiaXp: dados.ultimoDiaXp ?? null,
          });
          this._carregado.set(true);
        } else {
          this.criarDocInicial(uid).then(() => this._carregado.set(true));
        }
      }));
    });
  }

  private async criarDocInicial(uid: string): Promise<void> {
    // Aproveita marcações feitas no navegador antes do login (localStorage) como ponto de partida.
    const legado = this.lerLegado();
    await setDoc(doc(db, 'progresso', uid), { ...legado, xp: 0, ultimoDiaXp: null }, { merge: true });
  }

  private lerLegado(): Pick<Progresso, 'concluidas' | 'notas'> {
    try {
      const conclusoes = localStorage.getItem(LEGACY_STORAGE_KEY);
      const notas = localStorage.getItem(LEGACY_NOTAS_KEY);
      return {
        concluidas: conclusoes ? JSON.parse(conclusoes) : [],
        notas: notas ? JSON.parse(notas) : {},
      };
    } catch {
      return { concluidas: [], notas: {} };
    }
  }

  isConcluida(id: string): boolean {
    return this._progresso().concluidas.includes(id);
  }

  async toggleConcluida(id: string): Promise<void> {
    const uid = this.authService.usuario()?.uid;
    if (!uid) return;
    const concluida = this.isConcluida(id);
    await updateDoc(doc(db, 'progresso', uid), {
      concluidas: concluida ? arrayRemove(id) : arrayUnion(id),
    });
  }

  getNota(disciplinaId: string): string {
    return this._progresso().notas[disciplinaId] ?? '';
  }

  async setNota(disciplinaId: string, texto: string): Promise<void> {
    const uid = this.authService.usuario()?.uid;
    if (!uid) return;
    await updateDoc(doc(db, 'progresso', uid), { [`notas.${disciplinaId}`]: texto });
  }

  /**
   * Ajusta o XP vitalício por um delta — positivo ao conceder, negativo ao reverter
   * (ex: desmarcar uma atividade tira de volta o XP que ela tinha dado). Também grava
   * o motivo em `progresso/{uid}/historico`, um ledger append-only usado tanto pelo
   * toast de "+X XP" quanto pela tela de Histórico.
   */
  async registrarEventoXp(delta: number, motivo: string): Promise<void> {
    const uid = this.authService.usuario()?.uid;
    if (!uid || delta === 0) return;
    await updateDoc(doc(db, 'progresso', uid), { xp: increment(delta) });
    await addDoc(collection(db, 'progresso', uid, 'historico'), {
      data: new Date().toISOString(),
      delta,
      motivo,
    });
  }

  /** Concede o XP de login do dia e marca `ultimoDiaXp`, num só write — usado pelo GamificacaoService. */
  async registrarLoginDoDia(diaLocal: string, xpLogin: number): Promise<void> {
    const uid = this.authService.usuario()?.uid;
    if (!uid) return;
    await updateDoc(doc(db, 'progresso', uid), { xp: increment(xpLogin), ultimoDiaXp: diaLocal });
    await addDoc(collection(db, 'progresso', uid, 'historico'), {
      data: new Date().toISOString(),
      delta: xpLogin,
      motivo: 'Login do dia',
    });
  }

  exportar(): void {
    const atual = this._progresso();
    const backup: Backup = {
      versao: 1,
      exportadoEm: new Date().toISOString(),
      conclusoes: atual.concluidas,
      notas: atual.notas,
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const data = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const a = document.createElement('a');
    a.href = url;
    a.download = `guia-estudos-backup-${data}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  importar(arquivo: File): Promise<{ conclusoes: number; notas: number }> {
    return new Promise((resolve, reject) => {
      const uid = this.authService.usuario()?.uid;
      if (!uid) {
        reject(new Error('Você precisa estar logado para importar um backup.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backup = JSON.parse(e.target!.result as string) as Backup;
          if (!backup.conclusoes || !Array.isArray(backup.conclusoes)) {
            reject(new Error('Arquivo inválido: campo "conclusoes" ausente ou incorreto.'));
            return;
          }

          const notas = backup.notas ?? {};
          // merge: true — preserva xp/ultimoDiaXp, que não fazem parte do backup.
          await setDoc(doc(db, 'progresso', uid), { concluidas: backup.conclusoes, notas }, { merge: true });

          resolve({ conclusoes: backup.conclusoes.length, notas: Object.keys(notas).length });
        } catch {
          reject(new Error('Não foi possível ler o arquivo. Verifique se é um backup válido.'));
        }
      };

      reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
      reader.readAsText(arquivo);
    });
  }
}
