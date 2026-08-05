import { Injectable, NgZone, computed, effect, inject, signal } from '@angular/core';
import { addDoc, arrayRemove, arrayUnion, collection, doc, increment, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { AuthService } from './auth.service';
import { LinkUtil, Progresso, QuestionarioDiarioEstado } from '../models/models';

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

  private readonly _progresso = signal<Progresso>({ concluidas: [], notas: {}, xp: 0, ultimoDiaXp: null, questionarioDiario: null, linksUteis: {}, ultimoAvisoVistoEm: null });
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
  readonly questionarioDiario = computed(() => this._progresso().questionarioDiario ?? null);
  readonly ultimoAvisoVistoEm = computed(() => this._progresso().ultimoAvisoVistoEm ?? null);

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
      this._progresso.set({ concluidas: [], notas: {}, xp: 0, ultimoDiaXp: null, questionarioDiario: null, linksUteis: {}, ultimoAvisoVistoEm: null });
      this._carregado.set(false);
      if (!uid) return;

      this.unsub = onSnapshot(doc(db, 'progresso', uid), snap => this.ngZone.run(() => {
        if (snap.exists()) {
          const dados = snap.data() as Progresso;
          const xpNovo = dados.xp ?? 0;
          const xpAnterior = this._progresso().xp;
          this._progresso.set({
            concluidas: dados.concluidas ?? [],
            notas: dados.notas ?? {},
            xp: xpNovo,
            ultimoDiaXp: dados.ultimoDiaXp ?? null,
            questionarioDiario: dados.questionarioDiario ?? null,
            linksUteis: dados.linksUteis ?? {},
            ultimoAvisoVistoEm: dados.ultimoAvisoVistoEm ?? null,
          });
          this._carregado.set(true);

          // Espelha em usuarios/{uid}.xp sempre que o valor real muda em relação ao que
          // este cliente já conhecia — cobre tanto a sincronização normal (registrarEventoXp/
          // registrarLoginDoDia já fazem isso via increment) quanto o backfill de contas que
          // já tinham XP acumulado ANTES desse espelho existir (o valor placeholder inicial é
          // 0, então a primeira carga real já dispara este write com o valor correto). setDoc
          // com o valor absoluto, não increment — aqui é reconciliação, não um novo grant.
          if (xpNovo !== xpAnterior) {
            setDoc(doc(db, 'usuarios', uid), { xp: xpNovo }, { merge: true }).catch(() => {});
          }
        } else if (!snap.metadata.fromCache) {
          // Só cria o doc inicial quando o SERVIDOR confirma que ele realmente não existe.
          // Um snapshot que vem só do cache local reportando "não existe" (snap.metadata.
          // fromCache === true) pode só significar que este navegador/dispositivo nunca
          // cacheou o doc ainda (perfil novo, cache limpo, primeira vez neste aparelho) —
          // não que ele não existe de verdade no servidor. Agir sobre isso cedo demais foi
          // exatamente o que apagou XP real: criarDocInicial() usa setDoc+merge com
          // `xp: 0, ultimoDiaXp: null`, que SOBRESCREVE esses campos mesmo quando o
          // documento real (ainda não sincronizado neste cache) tinha um total maior.
          // Esperar o snapshot vindo do servidor evita agir sobre um "ainda não sei",
          // mesmo padrão já usado em outros lugares deste serviço (ver `carregado`).
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

  getLinks(disciplinaId: string): LinkUtil[] {
    return this._progresso().linksUteis?.[disciplinaId] ?? [];
  }

  async adicionarLink(disciplinaId: string, link: { titulo: string; url: string }): Promise<void> {
    const uid = this.authService.usuario()?.uid;
    if (!uid) return;
    const novo: LinkUtil = { id: crypto.randomUUID(), titulo: link.titulo, url: link.url };
    await updateDoc(doc(db, 'progresso', uid), { [`linksUteis.${disciplinaId}`]: arrayUnion(novo) });
  }

  // Reescreve o array inteiro (filtrado) em vez de arrayRemove: arrayRemove exige
  // igualdade exata do objeto, frágil para itens com múltiplos campos.
  async removerLink(disciplinaId: string, linkId: string): Promise<void> {
    const uid = this.authService.usuario()?.uid;
    if (!uid) return;
    const restantes = this.getLinks(disciplinaId).filter(l => l.id !== linkId);
    await updateDoc(doc(db, 'progresso', uid), { [`linksUteis.${disciplinaId}`]: restantes });
  }

  /** Marca até quando os avisos já foram vistos — usado por AvisosComponent ao abrir
   * /avisos, pra apagar o indicador de "novo aviso" na Dashboard. `dataIso` é o
   * `criadoEm` do aviso mais recente no momento da visita, não `new Date()`: assim,
   * se um aviso novo chegar via onSnapshot enquanto a página já está aberta, ele
   * ainda conta como "não visto" até a próxima vez que a página for (re)aberta. */
  async marcarAvisosVistos(dataIso: string): Promise<void> {
    const uid = this.authService.usuario()?.uid;
    if (!uid) return;
    await updateDoc(doc(db, 'progresso', uid), { ultimoAvisoVistoEm: dataIso });
  }

  /**
   * Ajusta o XP vitalício por um delta — positivo ao conceder, negativo ao reverter
   * (ex: desmarcar uma atividade tira de volta o XP que ela tinha dado). Também grava
   * o motivo em `progresso/{uid}/historico`, um ledger append-only usado tanto pelo
   * toast de "+X XP" quanto pela tela de Histórico.
   *
   * `delta` pode ser 0 — usado para eventos puramente informativos que não mexem no
   * XP (conquista desbloqueada, mudança de nível), que ainda assim devem aparecer no
   * Histórico. Só o `updateDoc` de XP é pulado nesse caso; o lançamento no ledger
   * sempre acontece (por isso o guard antigo, que também pulava o registro quando
   * `delta === 0`, foi removido).
   */
  async registrarEventoXp(delta: number, motivo: string): Promise<void> {
    const uid = this.authService.usuario()?.uid;
    if (!uid) return;
    if (delta !== 0) {
      await updateDoc(doc(db, 'progresso', uid), { xp: increment(delta) });
      // Espelha em usuarios/{uid}.xp — é o que a página /ranking lê (ver comentário no
      // model Usuario.xp: evita expor progresso/{uid} inteiro, com notas pessoais, a colegas).
      await updateDoc(doc(db, 'usuarios', uid), { xp: increment(delta) });
    }
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
    await updateDoc(doc(db, 'usuarios', uid), { xp: increment(xpLogin) });
    await addDoc(collection(db, 'progresso', uid, 'historico'), {
      data: new Date().toISOString(),
      delta: xpLogin,
      motivo: 'Login do dia',
    });
  }

  /** Substitui o estado do Questionário Diário inteiro — usado por QuizDiarioService.
   * setDoc+merge com um objeto aninhado real (não chave com ponto) faz merge profundo
   * correto no campo `questionarioDiario`, mesmo padrão já usado por outros estados
   * aninhados no app (ver "Historical bugs" no CLAUDE.md sobre a armadilha de dot-notation). */
  async salvarQuestionarioDiario(estado: QuestionarioDiarioEstado): Promise<void> {
    const uid = this.authService.usuario()?.uid;
    if (!uid) return;
    await setDoc(doc(db, 'progresso', uid), { questionarioDiario: estado }, { merge: true });
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
