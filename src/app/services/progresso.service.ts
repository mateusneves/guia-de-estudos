import { Injectable, NgZone, effect, inject, signal } from '@angular/core';
import { arrayRemove, arrayUnion, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
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

  private readonly _progresso = signal<Progresso>({ concluidas: [], notas: {} });
  private unsub: (() => void) | null = null;

  constructor() {
    effect(() => {
      const uid = this.authService.usuario()?.uid ?? null;
      this.unsub?.();
      this.unsub = null;
      this._progresso.set({ concluidas: [], notas: {} });
      if (!uid) return;

      this.unsub = onSnapshot(doc(db, 'progresso', uid), snap => this.ngZone.run(() => {
        if (snap.exists()) {
          const dados = snap.data() as Progresso;
          this._progresso.set({ concluidas: dados.concluidas ?? [], notas: dados.notas ?? {} });
        } else {
          this.criarDocInicial(uid);
        }
      }));
    });
  }

  private async criarDocInicial(uid: string): Promise<void> {
    // Aproveita marcações feitas no navegador antes do login (localStorage) como ponto de partida.
    const legado = this.lerLegado();
    await setDoc(doc(db, 'progresso', uid), legado, { merge: true });
  }

  private lerLegado(): Progresso {
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
          await setDoc(doc(db, 'progresso', uid), { concluidas: backup.conclusoes, notas }, { merge: false });

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
