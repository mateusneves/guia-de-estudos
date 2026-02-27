import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'guia-estudos-conclusoes';
const NOTAS_KEY = 'guia-estudos-notas';

interface Backup {
  versao: number;
  exportadoEm: string;
  conclusoes: string[];
  notas: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private concluidas = signal<Set<string>>(this.carregarConcluidas());
  private notas = signal<Record<string, string>>(this.carregarNotas());

  private carregarConcluidas(): Set<string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  private carregarNotas(): Record<string, string> {
    try {
      const raw = localStorage.getItem(NOTAS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  isConcluida(id: string): boolean {
    return this.concluidas().has(id);
  }

  toggleConcluida(id: string): void {
    const atual = new Set(this.concluidas());
    if (atual.has(id)) {
      atual.delete(id);
    } else {
      atual.add(id);
    }
    this.concluidas.set(atual);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...atual]));
  }

  getNota(disciplinaId: string): string {
    return this.notas()[disciplinaId] ?? '';
  }

  setNota(disciplinaId: string, texto: string): void {
    const atual = { ...this.notas(), [disciplinaId]: texto };
    this.notas.set(atual);
    localStorage.setItem(NOTAS_KEY, JSON.stringify(atual));
  }

  getConcluidas(): Set<string> {
    return this.concluidas();
  }

  exportar(): void {
    const backup: Backup = {
      versao: 1,
      exportadoEm: new Date().toISOString(),
      conclusoes: [...this.concluidas()],
      notas: this.notas(),
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
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target!.result as string) as Backup;

          if (!backup.conclusoes || !Array.isArray(backup.conclusoes)) {
            reject(new Error('Arquivo inválido: campo "conclusoes" ausente ou incorreto.'));
            return;
          }

          const novasConc = new Set<string>(backup.conclusoes);
          this.concluidas.set(novasConc);
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...novasConc]));

          const novasNotas = backup.notas ?? {};
          this.notas.set(novasNotas);
          localStorage.setItem(NOTAS_KEY, JSON.stringify(novasNotas));

          resolve({
            conclusoes: novasConc.size,
            notas: Object.keys(novasNotas).length,
          });
        } catch {
          reject(new Error('Não foi possível ler o arquivo. Verifique se é um backup válido.'));
        }
      };

      reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
      reader.readAsText(arquivo);
    });
  }
}
