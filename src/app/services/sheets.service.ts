import { Injectable, NgZone, inject, signal, computed } from '@angular/core';
import { DISCIPLINAS } from '../data/curso.data';
import { Avaliacao, Disciplina } from '../models/models';

// ================================================================
// CONFIGURE AQUI: cole a URL do Google Sheets publicado como CSV
// ================================================================
const SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQW4XBxdOCzQ3X_hNSitJ_Hsp3wN0-2sYbkgfgWK1DTgGgIXvHNPM3_x2Z_RTCi_HKlKAiJMx90Aa5L/pub?gid=0&single=true&output=csv';

const CODIGOS_VALIDOS = new Set([
  'TP03', 'TS12', 'TH52', 'TE17', 'TE20', 'TH04',
  'TH07', 'CG12', 'CG64', 'CG10', 'TP07', 'TP17', 'PCT05',
]);

@Injectable({ providedIn: 'root' })
export class SheetsService {
  private ngZone = inject(NgZone);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  private _carregado = signal(false);
  private _avaliacoes = signal<Avaliacao[]>([]);

  // Enquanto não carregado (ou em erro), retorna os dados estáticos do curso.data.ts
  // como fallback. Após o carregamento, retorna os dados do Google Sheets.
  readonly disciplinas = computed<Disciplina[]>(() => {
    if (!this._carregado()) return DISCIPLINAS;
    const avs = this._avaliacoes();
    return DISCIPLINAS.map(d => ({
      ...d,
      avaliacoes: avs.filter(a => a.disciplinaId === d.id),
    }));
  });

  constructor() {
    this.carregar();
  }

  carregar(): void {
    if (!SHEETS_CSV_URL) {
      this.erro.set('URL do Google Sheets não configurada.');
      this.carregando.set(false);
      return;
    }
    this.carregando.set(true);
    this.erro.set(null);
    this._carregado.set(false);

    // Usa fetch nativo para evitar problemas de CORS com Google Sheets
    fetch(SHEETS_CSV_URL)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(csv => {
        this.ngZone.run(() => {
          this._avaliacoes.set(this.parsearCSV(csv));
          this._carregado.set(true);
          this.carregando.set(false);
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          this.erro.set('Não foi possível carregar os dados do Google Sheets. Verifique a URL ou sua conexão.');
          this.carregando.set(false);
        });
      });
  }

  private parsearCSV(csv: string): Avaliacao[] {
    const linhas = this.splitCSV(csv);
    if (linhas.length < 2) return [];

    const resultado: Avaliacao[] = [];
    const contador: Record<string, number> = {};

    for (let i = 1; i < linhas.length; i++) {
      const cols = linhas[i];
      // Colunas: 0=PRAZO, 1=(vazio), 2=DATA, 3=TEMA, 4=DISCIPLINA, 5=OBJETIVO, 6=CODIGO, 7=TIPO, 8=PONTOS
      const codigo = (cols[6] ?? '').toUpperCase().trim();
      if (!codigo || !CODIGOS_VALIDOS.has(codigo)) continue;

      const dataStr   = (cols[2] ?? '').trim();
      const tema      = (cols[3] ?? '').trim();
      const objetivo  = (cols[5] ?? '').trim();
      const pontosStr = (cols[8] ?? '').trim();

      // Preserva o tipo original da planilha (normalizado: minúsculo, sem acentos)
      const tipo = (cols[7] ?? '').trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') || 'outro';

      const { data, dataDisplay } = this.parsearData(dataStr);
      const pontos = parseInt(pontosStr) || 0;
      const descricao = objetivo ? `${tema} — ${objetivo}` : tema;

      const disciplinaId = codigo.toLowerCase();
      contador[disciplinaId] = (contador[disciplinaId] ?? 0) + 1;
      const id = `${disciplinaId}-${contador[disciplinaId]}`;

      resultado.push({ id, disciplinaId, descricao, data, dataDisplay, pontos, tipo });
    }

    return resultado;
  }

  private parsearData(str: string): { data: string | null; dataDisplay: string } {
    if (!str) return { data: null, dataDisplay: 'Sem data' };
    const p = str.split('/');
    if (p.length !== 3) return { data: null, dataDisplay: str };
    const d = p[0].padStart(2, '0');
    const m = p[1].padStart(2, '0');
    const y = p[2].length === 2 ? '20' + p[2] : p[2];
    return { data: `${y}-${m}-${d}`, dataDisplay: `${d}/${m}/${y}` };
  }

  private splitCSV(text: string): string[][] {
    const rows: string[][] = [];
    let field = '';
    let inQuotes = false;
    let row: string[] = [];

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];
      if (ch === '"') {
        if (inQuotes && next === '"') { field += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        row.push(field); field = '';
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        if (ch === '\r' && next === '\n') i++;
        row.push(field); field = '';
        if (row.some(f => f.trim())) rows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }

    if (field || row.length) {
      row.push(field);
      if (row.some(f => f.trim())) rows.push(row);
    }

    return rows;
  }
}
