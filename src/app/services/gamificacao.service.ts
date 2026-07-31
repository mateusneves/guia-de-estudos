import { Injectable, NgZone, computed, effect, inject, signal } from '@angular/core';
import { collection, deleteField, doc, increment, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { AuthService } from './auth.service';
import { PeriodosService } from './periodos.service';
import { ProgressoService } from './progresso.service';
import { Avaliacao, Disciplina, ProgressoPeriodo } from '../models/models';
import { DefinicaoSelo, MARCOS_PROGRESSO, NIVEIS, SELOS, nivelPorXp, proximoNivel, seloPorId } from '../shared/gamificacao-catalogo';

const XP_LOGIN_DIARIO = 10;
// Exportado — app-atividade-card exibe esse valor por atividade (é fixo, não varia por atividade individual).
export const XP_POR_ATIVIDADE = 50;
const XP_POR_DISCIPLINA = 200;
const XP_POR_SEMESTRE = 500;

// Sem um mínimo cadastrado, completar a única atividade existente pareceria "100% do
// semestre"/"disciplina concluída" mesmo no início, já que atividades são cadastradas
// aos poucos ao longo do período — ver CLAUDE.md "Gamificação".
const MIN_ATIVIDADES_DISCIPLINA = 3;
const MIN_ATIVIDADES_PERIODO = 5;

// ids de selo cuja concessão é reavaliada do zero a cada mudança (podem ser revogados se
// deixarem de ser verdade) — diferente de bem_vindo/uma_semana/habito_criado, que refletem
// histórico de login e nunca são revogados.
const SELOS_REVERSIVEIS = new Set(['primeira_vitoria', 'disciplina_concluida', ...MARCOS_PROGRESSO.map(m => m.seloId)]);

function diaLocalDeHoje(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export interface NotificacaoXp {
  id: string;
  texto: string;
  delta: number;
}

type DisciplinaResumo = Pick<Disciplina, 'id' | 'nome'>;
type AvaliacaoResumo = Pick<Avaliacao, 'id' | 'disciplinaId' | 'nome' | 'descricao'>;

/**
 * Gamificação: XP/nível são vitalícios (nunca resetam); selos, dias de login e os
 * bônus de XP por atividade/disciplina são por período (zeram a cada semestre em
 * curso). Depende sempre do período ATIVO da turma do próprio usuário — nunca do
 * período que `DisciplinasService`/`AvaliacoesService` estejam exibindo no momento
 * (que o admin pode sobrescrever ao navegar pelo painel), por isso mantém sua
 * própria assinatura independente de disciplinas/avaliações.
 */
@Injectable({ providedIn: 'root' })
export class GamificacaoService {
  private authService = inject(AuthService);
  private periodosService = inject(PeriodosService);
  private progressoService = inject(ProgressoService);
  private ngZone = inject(NgZone);

  readonly xp = this.progressoService.xp;
  readonly nivel = computed(() => nivelPorXp(this.xp()));
  readonly proximoNivel = computed(() => proximoNivel(this.xp()));

  /** % de progresso dentro do nível atual, rumo ao próximo — 100 quando já está no nível máximo. */
  readonly progressoNivel = computed(() => {
    const nivel = this.nivel();
    const prox = this.proximoNivel();
    if (!prox) return 100;
    const faixa = prox.xpMinimo - nivel.xpMinimo;
    const feito = this.xp() - nivel.xpMinimo;
    return faixa > 0 ? Math.round((feito / faixa) * 100) : 100;
  });

  private readonly meuPeriodoId = computed(() => {
    const turmaId = this.authService.perfil()?.turmaId;
    return turmaId ? this.periodosService.ativoDaTurma(turmaId)?.id ?? null : null;
  });

  private readonly _disciplinas = signal<DisciplinaResumo[]>([]);
  private readonly _avaliacoes = signal<AvaliacaoResumo[]>([]);
  private readonly _progressoPeriodo = signal<ProgressoPeriodo | null>(null);
  // true só depois do primeiro snapshot real de cada um — evita tratar o "[]" transitório
  // (entre o período resolver e o primeiro onSnapshot chegar) como "não há atividades".
  private readonly _disciplinasProntas = signal(false);
  private readonly _avaliacoesProntas = signal(false);
  readonly erro = signal<string | null>(null);

  /** Toasts de "+X XP"/"-X XP" ativos — consumido pelo componente de notificação em `app.ts`. */
  readonly notificacoes = signal<NotificacaoXp[]>([]);

  readonly totalAtividades = computed(() => this._avaliacoes().length);
  readonly percentualPeriodo = computed(() => {
    const total = this.totalAtividades();
    if (total === 0) return 0;
    const concluidas = new Set(this.progressoService.concluidas());
    const feitas = this._avaliacoes().filter(a => concluidas.has(a.id)).length;
    return Math.round((feitas / total) * 100);
  });

  readonly selos = computed(() => this._progressoPeriodo()?.selos ?? {});
  readonly ultimasConquistas = computed<DefinicaoSelo[]>(() =>
    Object.entries(this.selos())
      .sort((a, b) => b[1].localeCompare(a[1]))
      .slice(0, 3)
      .map(([id]) => SELOS.find(s => s.id === id))
      .filter((s): s is DefinicaoSelo => !!s)
  );

  private unsubDisciplinas: (() => void) | null = null;
  private unsubAvaliacoes: (() => void) | null = null;
  private unsubProgressoPeriodo: (() => void) | null = null;
  private docId: string | null = null;
  private loginEmAndamento = false;
  private avaliarEmAndamento = false;

  constructor() {
    // Disciplinas/avaliações do MEU período — independente do que o painel admin esteja navegando.
    effect(() => {
      const periodoId = this.meuPeriodoId();
      this.unsubDisciplinas?.();
      this.unsubAvaliacoes?.();
      this._disciplinas.set([]);
      this._avaliacoes.set([]);
      this._disciplinasProntas.set(false);
      this._avaliacoesProntas.set(false);
      if (!periodoId) return;

      this.unsubDisciplinas = onSnapshot(
        query(collection(db, 'disciplinas'), where('periodoId', '==', periodoId)),
        snap => this.ngZone.run(() => {
          this._disciplinas.set(snap.docs.map(d => ({ id: d.id, nome: (d.data()['nome'] as string) ?? '' })));
          this._disciplinasProntas.set(true);
        }),
        err => this.ngZone.run(() => {
          console.error('[Gamificação] falha ao ler disciplinas:', err);
          this.erro.set('Não foi possível carregar seu progresso de gamificação.');
        })
      );
      this.unsubAvaliacoes = onSnapshot(
        query(collection(db, 'avaliacoes'), where('periodoId', '==', periodoId)),
        snap => this.ngZone.run(() => {
          this._avaliacoes.set(snap.docs.map(d => ({ id: d.id, ...d.data() } as Avaliacao)));
          this._avaliacoesProntas.set(true);
        }),
        err => this.ngZone.run(() => {
          console.error('[Gamificação] falha ao ler avaliações:', err);
          this.erro.set('Não foi possível carregar seu progresso de gamificação.');
        })
      );
    });

    // Estado de gamificação do (uid, período) atual.
    effect(() => {
      const uid = this.authService.usuario()?.uid;
      const periodoId = this.meuPeriodoId();
      this.unsubProgressoPeriodo?.();
      this.unsubProgressoPeriodo = null;
      this._progressoPeriodo.set(null);
      this.docId = null;
      if (!uid || !periodoId) return;

      this.docId = `${uid}_${periodoId}`;
      this.unsubProgressoPeriodo = onSnapshot(doc(db, 'progresso_periodo', this.docId), snap => this.ngZone.run(() => {
        this.erro.set(null);
        if (snap.exists()) {
          this._progressoPeriodo.set(snap.data() as ProgressoPeriodo);
        } else {
          const vazio: ProgressoPeriodo = { uid, periodoId, selos: {}, atividadesBonificadas: [], disciplinasBonificadas: [], diasComLogin: 0 };
          this._progressoPeriodo.set(vazio);
          setDoc(doc(db, 'progresso_periodo', this.docId!), vazio).catch(err => this.ngZone.run(() => {
            console.error('[Gamificação] falha ao criar progresso_periodo:', err);
            this.erro.set('Não foi possível salvar seu progresso de gamificação.');
          }));
        }
      }), err => this.ngZone.run(() => {
        console.error('[Gamificação] falha ao ler progresso_periodo (verifique se firestore.rules foi publicado):', err);
        this.erro.set('Não foi possível carregar seu progresso de gamificação.');
      }));
    });

    // Login diário — concede XP/selo uma vez por dia local, quando tudo estiver carregado.
    effect(() => {
      const periodoDoc = this._progressoPeriodo();
      // Lido incondicionalmente antes de qualquer "return" abaixo — mesmo motivo do
      // comentário no efeito de avaliação logo adiante: preserva o rastreamento de
      // dependência do Angular mesmo quando a guarda faz um retorno antecipado.
      const progressoCarregado = this.progressoService.carregado();
      if (!periodoDoc || !progressoCarregado) return;
      if (this.loginEmAndamento) return;
      this.loginEmAndamento = true;
      this.registrarLoginDiario(periodoDoc)
        .catch(err => {
          console.error('[Gamificação] falha ao registrar login diário:', err);
          this.erro.set('Não foi possível registrar seu progresso de hoje.');
        })
        .finally(() => { this.loginEmAndamento = false; });
    });

    // Atividades/disciplinas/% do semestre — reavalia sempre que algo relevante mudar.
    effect(() => {
      const periodoDoc = this._progressoPeriodo();
      const disciplinas = this._disciplinas();
      const avaliacoes = this._avaliacoes();
      const disciplinasProntas = this._disciplinasProntas();
      const avaliacoesProntas = this._avaliacoesProntas();
      // Lido incondicionalmente, ANTES de qualquer guarda abaixo: se um retorno
      // antecipado acontecesse antes desta leitura, o Angular pararia de rastrear
      // concluidas() como dependência deste efeito (ex: enquanto uma gravação anterior
      // ainda está em andamento — o onSnapshot local ecoa a própria escrita quase
      // instantaneamente, antes do await dela terminar). Sem isso, desmarcar e remarcar
      // a mesma atividade em seguida silenciosamente parava de conceder XP.
      const progressoConcluidas = this.progressoService.concluidas();
      const progressoCarregado = this.progressoService.carregado();
      // progressoCarregado / disciplinasProntas / avaliacoesProntas: enquanto qualquer
      // um ainda não recebeu seu primeiro snapshot real (ex: logo após um login, antes
      // do Firestore responder), os valores acima são só placeholders locais vazios —
      // avaliar contra eles faria parecer que tudo foi desmarcado, revogando XP/selos
      // de verdade por engano. Foi exatamente isso que causou XP negativo após um
      // logout+login — ver CLAUDE.md "Gamificação".
      if (!periodoDoc || !progressoCarregado || !disciplinasProntas || !avaliacoesProntas) return;
      void progressoConcluidas;
      // Guarda de reentrância: enquanto uma avaliação anterior ainda não terminou de
      // gravar (atividadesBonificadas/disciplinasBonificadas/selos), `periodoDoc` aqui
      // pode estar desatualizado em relação a ela — reavaliar com esse dado velho
      // concederia o mesmo XP de novo. Ignora esta chamada; o próprio efeito reroda
      // sozinho quando o snapshot da gravação em andamento chegar, já com dado fresco.
      if (this.avaliarEmAndamento) return;
      this.avaliarEmAndamento = true;
      this.avaliarProgresso(periodoDoc, disciplinas, avaliacoes)
        .catch(err => {
          console.error('[Gamificação] falha ao avaliar progresso:', err);
          this.erro.set('Não foi possível salvar seu progresso.');
        })
        .finally(() => { this.avaliarEmAndamento = false; });
    });
  }

  private async registrarLoginDiario(periodoDoc: ProgressoPeriodo): Promise<void> {
    const hoje = diaLocalDeHoje();
    if (this.progressoService.ultimoDiaXp() === hoje) return;

    const xpAntes = this.xp();
    await this.progressoService.registrarLoginDoDia(hoje, XP_LOGIN_DIARIO);
    this.notificar(XP_LOGIN_DIARIO, 'Login do dia');

    const novoDias = periodoDoc.diasComLogin + 1;
    const novosSelos: Record<string, string> = {};
    const agora = new Date().toISOString();
    // bem_vindo/uma_semana/habito_criado refletem histórico de login — só somam, nunca são revogados.
    if (!periodoDoc.selos['bem_vindo']) novosSelos['bem_vindo'] = agora;
    if (novoDias >= 7 && !periodoDoc.selos['uma_semana']) novosSelos['uma_semana'] = agora;
    if (novoDias >= 30 && !periodoDoc.selos['habito_criado']) novosSelos['habito_criado'] = agora;

    await this.atualizarProgressoPeriodo({
      diasComLogin: increment(1),
      ...(Object.keys(novosSelos).length > 0 ? { selos: novosSelos } : {}),
    });

    // Antes, essas 3 conquistas de frequência eram gravadas silenciosamente — nem toast
    // nem linha no Histórico. Agora viram evento (0 XP) como qualquer outra conquista.
    for (const id of Object.keys(novosSelos)) {
      const selo = seloPorId(id);
      if (!selo) continue;
      await this.progressoService.registrarEventoXp(0, `Conquista desbloqueada: ${selo.titulo}`);
      this.notificar(0, `Conquista desbloqueada: ${selo.titulo}`);
    }

    await this.registrarMudancasDeNivel(xpAntes, xpAntes + XP_LOGIN_DIARIO);
  }

  /**
   * Detecta se o XP cruzou uma fronteira de nível (pra cima ou pra baixo, já que XP pode
   * ser revogado) e grava um evento (0 XP, só informativo) no Histórico + toast pra cada
   * nível cruzado — normalmente só um, mas cobre o caso raro de um lote de XP cruzar mais
   * de um nível de uma vez. Recebe xpAntes/xpDepois calculados aritmeticamente pelo
   * chamador (nunca relendo `this.xp()` depois de um `await`: o snapshot local do
   * Firestore ecoa a própria escrita de forma assíncrona, então o valor "fresco" do sinal
   * não é confiável logo após o await — ver "Historical bugs" no CLAUDE.md).
   */
  private async registrarMudancasDeNivel(xpAntes: number, xpDepois: number): Promise<void> {
    if (xpAntes === xpDepois) return;
    const nivelAntes = nivelPorXp(xpAntes);
    const nivelDepois = nivelPorXp(xpDepois);
    if (nivelAntes.nivel === nivelDepois.nivel) return;

    const subindo = nivelDepois.nivel > nivelAntes.nivel;
    const cruzados = NIVEIS
      .filter(n => subindo
        ? n.nivel > nivelAntes.nivel && n.nivel <= nivelDepois.nivel
        : n.nivel < nivelAntes.nivel && n.nivel >= nivelDepois.nivel)
      .sort((a, b) => subindo ? a.nivel - b.nivel : b.nivel - a.nivel);

    for (const n of cruzados) {
      await this.progressoService.registrarEventoXp(0, `Novo nível alcançado: ${n.titulo}`);
      this.notificar(0, `Novo nível alcançado: ${n.titulo}`);
    }
  }

  /**
   * Recalcula do zero "o que deveria ser verdade agora" (atividades concluídas, disciplinas
   * 100% completas, marcos de % do período, selos derivados) e reconcilia contra o que já
   * estava gravado — concede o que passou a ser verdade, REVOGA (XP e selo) o que deixou de
   * ser (ex: aluno desmarcou uma atividade que fechava uma disciplina). Só disciplina_concluida
   * e os marcos de progresso_% exigem um mínimo de atividades cadastradas (`MIN_ATIVIDADES_*`)
   * para evitar que 1 atividade solitária pareça "100% do semestre" enquanto o período ainda
   * está sendo montado aos poucos pelo admin — ver CLAUDE.md "Gamificação".
   */
  private async avaliarProgresso(
    periodoDoc: ProgressoPeriodo,
    disciplinas: DisciplinaResumo[],
    avaliacoes: AvaliacaoResumo[]
  ): Promise<void> {
    const concluidas = new Set(this.progressoService.concluidas());
    const agora = new Date().toISOString();

    const atividadesAgora = new Set(avaliacoes.filter(a => concluidas.has(a.id)).map(a => a.id));

    const disciplinasAgora = new Set<string>();
    for (const d of disciplinas) {
      const atividadesDaDisciplina = avaliacoes.filter(a => a.disciplinaId === d.id);
      if (atividadesDaDisciplina.length < MIN_ATIVIDADES_DISCIPLINA) continue;
      if (atividadesDaDisciplina.every(a => concluidas.has(a.id))) disciplinasAgora.add(d.id);
    }

    const percentualValido = avaliacoes.length >= MIN_ATIVIDADES_PERIODO;
    const percentual = avaliacoes.length > 0 ? (atividadesAgora.size / avaliacoes.length) * 100 : 0;
    const marcosAgora = percentualValido ? MARCOS_PROGRESSO.filter(m => percentual >= m.percentual).map(m => m.seloId) : [];

    const selosReversiveisAgora = new Set<string>(marcosAgora);
    if (atividadesAgora.size > 0) selosReversiveisAgora.add('primeira_vitoria');
    if (disciplinasAgora.size > 0) selosReversiveisAgora.add('disciplina_concluida');

    const atividadesAntes = new Set(periodoDoc.atividadesBonificadas);
    const disciplinasAntes = new Set(periodoDoc.disciplinasBonificadas);
    const selosAntesReversiveis = new Set(Object.keys(periodoDoc.selos).filter(id => SELOS_REVERSIVEIS.has(id)));

    const atividadesAdicionadas = [...atividadesAgora].filter(id => !atividadesAntes.has(id));
    const atividadesRemovidas = [...atividadesAntes].filter(id => !atividadesAgora.has(id));
    const disciplinasAdicionadas = [...disciplinasAgora].filter(id => !disciplinasAntes.has(id));
    const disciplinasRemovidas = [...disciplinasAntes].filter(id => !disciplinasAgora.has(id));
    const selosAdicionados = [...selosReversiveisAgora].filter(id => !selosAntesReversiveis.has(id));
    const selosRemovidos = [...selosAntesReversiveis].filter(id => !selosReversiveisAgora.has(id));

    const nadaMudou = atividadesAdicionadas.length === 0 && atividadesRemovidas.length === 0
      && disciplinasAdicionadas.length === 0 && disciplinasRemovidas.length === 0
      && selosAdicionados.length === 0 && selosRemovidos.length === 0;
    if (nadaMudou) return;

    // xpAntes + a soma dos deltas abaixo (nunca relendo this.xp() de novo depois de um
    // await) é o que registrarMudancasDeNivel usa pra saber se este lote cruzou um nível
    // — ver comentário desse método.
    const xpAntes = this.xp();
    let deltaTotal = 0;

    // Grava primeiro os campos "de estado" (bonificadas/selos) — os eventos de XP abaixo
    // usam registrarEventoXp (increment + ledger), independentes deste write.
    const selosPatch: Record<string, unknown> = {};
    for (const id of selosAdicionados) selosPatch[id] = agora;
    for (const id of selosRemovidos) selosPatch[id] = deleteField();

    await this.atualizarProgressoPeriodo({
      atividadesBonificadas: [...atividadesAgora],
      disciplinasBonificadas: [...disciplinasAgora],
      ...(Object.keys(selosPatch).length > 0 ? { selos: selosPatch } : {}),
    });

    for (const id of atividadesAdicionadas) {
      const av = avaliacoes.find(a => a.id === id);
      const titulo = av?.nome || av?.descricao || 'Atividade';
      await this.progressoService.registrarEventoXp(XP_POR_ATIVIDADE, `Atividade concluída: ${titulo}`);
      this.notificar(XP_POR_ATIVIDADE, `Atividade concluída: ${titulo}`);
      deltaTotal += XP_POR_ATIVIDADE;
    }
    for (const id of atividadesRemovidas) {
      await this.progressoService.registrarEventoXp(-XP_POR_ATIVIDADE, 'Atividade desmarcada');
      this.notificar(-XP_POR_ATIVIDADE, 'Atividade desmarcada');
      deltaTotal -= XP_POR_ATIVIDADE;
    }
    for (const id of disciplinasAdicionadas) {
      const nome = disciplinas.find(d => d.id === id)?.nome || 'Disciplina';
      await this.progressoService.registrarEventoXp(XP_POR_DISCIPLINA, `Disciplina concluída: ${nome}`);
      this.notificar(XP_POR_DISCIPLINA, `Disciplina concluída: ${nome}`);
      deltaTotal += XP_POR_DISCIPLINA;
    }
    for (const id of disciplinasRemovidas) {
      const nome = disciplinas.find(d => d.id === id)?.nome || 'Disciplina';
      await this.progressoService.registrarEventoXp(-XP_POR_DISCIPLINA, `Disciplina não está mais concluída: ${nome}`);
      this.notificar(-XP_POR_DISCIPLINA, `Disciplina não está mais concluída: ${nome}`);
      deltaTotal -= XP_POR_DISCIPLINA;
    }
    if (selosAdicionados.includes('progresso_100')) {
      await this.progressoService.registrarEventoXp(XP_POR_SEMESTRE, '100% do período concluído');
      this.notificar(XP_POR_SEMESTRE, '100% do período concluído');
      deltaTotal += XP_POR_SEMESTRE;
    }
    if (selosRemovidos.includes('progresso_100')) {
      await this.progressoService.registrarEventoXp(-XP_POR_SEMESTRE, 'Período não está mais 100% concluído');
      this.notificar(-XP_POR_SEMESTRE, 'Período não está mais 100% concluído');
      deltaTotal -= XP_POR_SEMESTRE;
    }
    // Toda conquista desbloqueada vira sua própria linha no Histórico (0 XP quando ela
    // não carrega XP próprio — os 3 marcos acima já disparam seu próprio toast "+X XP",
    // então só evitam um SEGUNDO toast redundante aqui; a linha no Histórico é gravada
    // de qualquer forma, pra toda conquista aparecer lá).
    for (const id of selosAdicionados) {
      const selo = seloPorId(id);
      if (!selo) continue;
      await this.progressoService.registrarEventoXp(0, `Conquista desbloqueada: ${selo.titulo}`);
      const jaTemToastProprio = id === 'progresso_100' || id === 'disciplina_concluida' || id === 'primeira_vitoria';
      if (!jaTemToastProprio) {
        this.notificar(0, `Conquista desbloqueada: ${selo.titulo}`);
      }
    }

    await this.registrarMudancasDeNivel(xpAntes, xpAntes + deltaTotal);
  }

  /**
   * Concede XP a partir de uma fonte externa ao ciclo normal de reconciliação
   * (atividade/disciplina/login) — hoje só QuizDiarioService (Questionário Diário) usa
   * isso. Mesma sequência ledger+toast+verificação de nível que os demais grants já
   * fazem internamente, exposta aqui como método público pra não duplicar essa lógica
   * em cada novo serviço que precisar conceder XP.
   */
  async registrarXpExtra(delta: number, motivo: string): Promise<void> {
    const xpAntes = this.xp();
    await this.progressoService.registrarEventoXp(delta, motivo);
    this.notificar(delta, motivo);
    await this.registrarMudancasDeNivel(xpAntes, xpAntes + delta);
  }

  private notificar(delta: number, motivo: string): void {
    const texto = delta !== 0 ? `${delta > 0 ? '+' : ''}${delta} XP — ${motivo}` : motivo;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.notificacoes.update(atual => [...atual, { id, texto, delta }]);
    setTimeout(() => this.notificacoes.update(atual => atual.filter(n => n.id !== id)), 5000);
  }

  // setDoc({merge:true}) em vez de updateDoc: o doc "vazio" criado no snapshot inicial pode
  // ainda não ter sido confirmado pelo servidor quando um destes grants dispara — updateDoc
  // exigiria o doc já existir, merge:true funciona nos dois casos. Objetos aninhados (não
  // chaves com ponto — ver histórico de bug em CLAUDE.md) fazem merge profundo do mapa
  // "selos", inclusive com deleteField() por chave para revogar um selo específico.
  private async atualizarProgressoPeriodo(dados: Record<string, unknown>): Promise<void> {
    if (!this.docId) return;
    await setDoc(doc(db, 'progresso_periodo', this.docId), dados as { [x: string]: never }, { merge: true });
  }
}
