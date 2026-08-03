import { Injectable, NgZone, computed, signal } from '@angular/core';
import { addDoc, collection, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
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

  /**
   * Reset administrativo, sob demanda (botão em /admin/usuarios): zera o XP vitalício de
   * TODO mundo — `progresso/{uid}.xp` e o espelho `usuarios/{uid}.xp` — motivado pelo bug
   * de 2026-08 que zerava XP de contas ao acaso (ver CLAUDE.md "Historical bugs" na seção
   * de Gamificação), tornando os totais acumulados até aqui não confiáveis pra ninguém.
   *
   * Cada usuário afetado ganha uma linha nova no próprio Histórico (delta negativo trazendo
   * o total pra 0, motivo explicando o porquê) — nunca edita/apaga os lançamentos antigos,
   * só soma mais um evento, mesmo espírito append-only do resto do ledger.
   *
   * Deliberadamente NÃO mexe em `progresso_periodo` (selos, atividadesBonificadas,
   * disciplinasBonificadas, diasComLogin): essas flags continuam registrando com precisão
   * "essa atividade/disciplina já pagou XP uma vez" — apagá-las faria a próxima reconciliação
   * de GamificacaoService.avaliarProgresso() pagar tudo de novo automaticamente, o que
   * anularia o próprio reset. Selos concedidos continuam concedidos; só o contador de XP e
   * seu extrato são reiniciados.
   */
  async zerarXpDeTodos(): Promise<number> {
    const motivo = 'Reinício da temporada de XP (correção de bug de sincronização)';
    let afetados = 0;
    for (const u of this.usuarios()) {
      const progressoSnap = await getDoc(doc(db, 'progresso', u.uid));
      if (!progressoSnap.exists()) continue;
      const xpAtual = (progressoSnap.data() as Progresso).xp ?? 0;
      if (xpAtual === 0) continue;

      await updateDoc(doc(db, 'progresso', u.uid), { xp: 0 });
      await updateDoc(doc(db, 'usuarios', u.uid), { xp: 0 });
      await addDoc(collection(db, 'progresso', u.uid, 'historico'), {
        data: new Date().toISOString(),
        delta: -xpAtual,
        motivo,
      });
      afetados++;
    }
    return afetados;
  }
}
