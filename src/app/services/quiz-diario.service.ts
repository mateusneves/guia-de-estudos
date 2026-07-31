import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ProgressoService } from './progresso.service';
import { GamificacaoService } from './gamificacao.service';
import { QuestaoQuiz } from '../shared/questionario-westminster';
import { QuestionarioDiarioEstado } from '../models/models';

const TENTATIVAS_MAX = 2;
export const XP_QUESTIONARIO_DIARIO = 30;

function diaLocalDeHoje(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export type ResultadoResposta = 'correto' | 'incorreto' | 'esgotado';

/**
 * Questionário Diário (added 2026-07-31): uma pergunta sorteada do catálogo
 * `questionario-westminster.ts`, oferecida uma vez por "primeiro acesso do dia" —
 * verificado pelo campo `dia` já persistido em `progresso/{uid}.questionarioDiario`,
 * não por qualquer estado local de sessão/navegador. Isso significa que o efeito
 * abaixo só sorteia e abre o modal sozinho quando ainda NÃO existe registro de hoje;
 * uma vez criado (mesmo que o usuário feche sem responder), ele nunca mais reabre
 * sozinho — só via `abrirModal()`, chamado pelo botão da Dashboard.
 *
 * O catálogo (92 perguntas, ~100KB) é importado dinamicamente (`import(...)`), não no
 * topo do arquivo — este serviço é injetado eagerly por `App` (root), então um import
 * estático colocaria o catálogo inteiro no bundle inicial para todo mundo, mesmo quem
 * nunca abre o modal na sessão. Ver CLAUDE.md "Questionário Diário".
 */
@Injectable({ providedIn: 'root' })
export class QuizDiarioService {
  private authService = inject(AuthService);
  private progressoService = inject(ProgressoService);
  private gamificacao = inject(GamificacaoService);

  readonly modalAberto = signal(false);

  private readonly _catalogo = signal<QuestaoQuiz[] | null>(null);

  readonly perguntaHoje = computed<QuestaoQuiz | null>(() => {
    const estado = this.progressoService.questionarioDiario();
    const catalogo = this._catalogo();
    if (!estado || !catalogo) return null;
    return catalogo.find(q => q.id === estado.questaoId) ?? null;
  });

  /** true só quando existe uma pergunta sorteada pra hoje e ela ainda não foi concluída — controla o botão da Dashboard. */
  readonly disponivelHoje = computed(() => {
    const estado = this.progressoService.questionarioDiario();
    return !!estado && estado.dia === diaLocalDeHoje() && !estado.concluido;
  });

  private criandoQuestao = false;
  private carregandoCatalogo: Promise<QuestaoQuiz[]> | null = null;

  constructor() {
    effect(() => {
      const carregado = this.progressoService.carregado();
      const estado = this.progressoService.questionarioDiario();
      if (!carregado) return;
      const hoje = diaLocalDeHoje();
      if (estado?.dia === hoje) {
        // Já existe registro de hoje (respondido ou não) — não abre sozinho, mas
        // ainda precisa do catálogo carregado pra perguntaHoje()/o modal renderizarem
        // quando o usuário reabrir pelo botão da Dashboard.
        void this.garantirCatalogo();
        return;
      }
      if (this.criandoQuestao) return;
      this.criandoQuestao = true;
      this.iniciarNovaQuestaoDoDia(hoje).finally(() => { this.criandoQuestao = false; });
    });
  }

  private garantirCatalogo(): Promise<QuestaoQuiz[]> {
    if (this._catalogo()) return Promise.resolve(this._catalogo()!);
    if (!this.carregandoCatalogo) {
      this.carregandoCatalogo = import('../shared/questionario-westminster').then(mod => {
        this._catalogo.set(mod.QUESTIONARIO_WESTMINSTER);
        return mod.QUESTIONARIO_WESTMINSTER;
      });
    }
    return this.carregandoCatalogo;
  }

  private async iniciarNovaQuestaoDoDia(hoje: string): Promise<void> {
    const catalogo = await this.garantirCatalogo();
    const questao = catalogo[Math.floor(Math.random() * catalogo.length)];
    const estado: QuestionarioDiarioEstado = { dia: hoje, questaoId: questao.id, tentativas: 0, concluido: false, acertou: false };
    await this.progressoService.salvarQuestionarioDiario(estado);
    this.modalAberto.set(true);
  }

  abrirModal(): void {
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
  }

  /** Registra uma tentativa de resposta — concede XP na primeira vez que acertar; nunca revoga (diferente do XP de atividades, aqui não há "desmarcar"). */
  async responder(alternativa: string): Promise<ResultadoResposta> {
    const estado = this.progressoService.questionarioDiario();
    const questao = this.perguntaHoje();
    if (!estado || !questao || estado.concluido) return 'esgotado';

    if (alternativa === questao.respostaCorreta) {
      const novoEstado: QuestionarioDiarioEstado = { ...estado, concluido: true, acertou: true };
      await this.progressoService.salvarQuestionarioDiario(novoEstado);
      await this.gamificacao.registrarXpExtra(XP_QUESTIONARIO_DIARIO, 'Questionário diário — resposta correta');
      return 'correto';
    }

    const tentativas = estado.tentativas + 1;
    const esgotou = tentativas >= TENTATIVAS_MAX;
    const novoEstado: QuestionarioDiarioEstado = { ...estado, tentativas, concluido: esgotou, acertou: false };
    await this.progressoService.salvarQuestionarioDiario(novoEstado);
    return esgotou ? 'esgotado' : 'incorreto';
  }
}
