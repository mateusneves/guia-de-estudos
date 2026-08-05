export interface Avaliacao {
  id: string;
  periodoId: string;
  disciplinaId: string;
  /** Título curto (ex: "Prova Final"). Atividades criadas antes desse campo existir podem não ter — trate como opcional na exibição, com `descricao` como fallback. */
  nome: string;
  descricao: string; // detalhe opcional
  data: string | null; // ISO date string or null for continuous
  dataDisplay: string; // Human-readable date
  pontos: number;
  tipo: string;
  concluida?: boolean;
}

export interface AulaHorario {
  dia: string;
  modulo: string;
  horario: string;
}

/**
 * Um bloco de horário cadastrado pelo admin para uma turma (ex: "M1" / "07:00 às 08:40").
 * Disciplinas selecionam um destes ao definir seus horários, em vez de digitar o
 * horário livremente — o texto (`horario`) só é digitado uma vez, aqui.
 */
export interface ModuloHorario {
  id: string;
  turmaId: string;
  codigo: string;
  horario: string;
}

export interface Disciplina {
  id: string;
  periodoId: string;
  codigo: string;
  nome: string;
  nomeCompleto: string;
  cor: string;
  corTexto: string;
  /** Texto livre. Disciplinas criadas antes dessa mudança podem trazer o formato antigo (array de {unidade, descricao}) direto do Firestore — `DisciplinasService` normaliza isso para string na leitura. */
  conteudoProgramatico: string;
  avaliacoes: Avaliacao[];
  bibliografia: string[];
  horarios: AulaHorario[];
}

export type Role = 'aluno' | 'administrador';

/** O grupo de alunos que entrou junto — persiste por todo o curso, não muda a cada semestre. */
export interface Turma {
  id: string;
  nome: string;
  ativa: boolean;
  criadoEm: string;
  /** Token do link de convite de cadastro atual da turma (usado em /cadastro?convite=...). */
  conviteToken?: string;
  /** Código de autorização exigido no cadastro, verificado via regra do Firestore — nunca lido antes do login. */
  codigoConvite?: string;
  /** id de um tema em `shared/temas-catalogo.ts` — ausente/desconhecido cai no tema "padrao". Só admin altera. */
  temaId?: string;
}

/** Dados públicos de um convite, resolvidos a partir do token na URL — a única coisa legível antes do login. */
export interface ConvitePublico {
  id: string;
  turmaId: string;
  turmaNome: string;
  ativo: boolean;
}

/** Um ciclo letivo (semestre) dentro de uma turma — é aqui que disciplinas/atividades vivem. */
export interface Periodo {
  id: string;
  turmaId: string;
  nome: string;
  anoSemestre: string;
  ativo: boolean;
  criadoEm: string;
}

export interface Usuario {
  uid: string;
  nome: string;
  email: string;
  role: Role;
  turmaId: string;
  ativo: boolean;
  criadoEm: string;
  /** Seed usada para gerar o avatar (DiceBear, estilo Open Peeps) — opcional, usuários antigos podem não ter. */
  avatarSeed?: string;
  /** true se o avatar foi escolhido com "priorizar barba/bigode" ativo — precisa ficar
   * salvo junto da seed porque a mesma seed pode render traços diferentes dependendo
   * desse parâmetro (ver avatarUrl em shared/avatar.ts); sem isso, o avatar escolhido em
   * /perfil ficaria diferente do exibido no resto do app. */
  avatarComBarba?: boolean;
  /** Código de autorização usado no cadastro (registro/auditoria) — não tem função depois de criada a conta. */
  codigoConvite?: string;
  /** Espelho de progresso/{uid}.xp, mantido por ProgressoService a cada grant/revogação de XP.
   * Existe só para a página /ranking: as regras do Firestore liberaram a leitura de usuarios/{uid}
   * para colegas da mesma turma, mas progresso/{uid} continua restrito a self/admin (tem notas
   * pessoais e a lista de atividades concluídas, que não devem ficar visíveis para colegas) — por
   * isso o XP é replicado aqui em vez do ranking ler progresso/{uid} de cada colega diretamente. */
  xp?: number;
}

/** Estado do Questionário Diário (added 2026-07-31) — um por dia local, dentro de `progresso/{uid}`
 * (não numa coleção própria: é só mais um campo do documento que já é privado ao dono). `dia` é
 * o que determina se o estado ainda vale "hoje" — um `dia` diferente do local atual é tratado como
 * inexistente por QuizDiarioService, que sorteia e persiste uma questão nova. */
export interface QuestionarioDiarioEstado {
  dia: string;
  questaoId: number;
  /** tentativas erradas já usadas (máximo 2, ver TENTATIVAS_MAX em quiz-diario.service.ts). */
  tentativas: number;
  /** true quando acertou OU esgotou as tentativas — controla se o botão da Dashboard aparece. */
  concluido: boolean;
  acertou: boolean;
}

/** Um link útil pessoal, adicionado por um aluno para uma disciplina específica (não visível a outros usuários). */
export interface LinkUtil {
  id: string;
  titulo: string;
  url: string;
}

export interface Progresso {
  concluidas: string[];
  notas: Record<string, string>;
  /** XP vitalício — nunca diminui, acumula entre semestres (diferente dos selos, que são por período). */
  xp: number;
  /** Último dia (local, "AAAA-MM-DD") em que o XP de login diário já foi concedido — evita conceder duas vezes no mesmo dia. */
  ultimoDiaXp: string | null;
  /** null até a primeira pergunta do dia ser sorteada (ver QuizDiarioService) — usuários antigos também não têm este campo até então. */
  questionarioDiario?: QuestionarioDiarioEstado | null;
  /** Links pessoais por disciplina, mesmo esquema de chave que `notas`. Ausente em docs antigos. */
  linksUteis?: Record<string, LinkUtil[]>;
  /** ISO do aviso mais recente que este usuário já visualizou em /avisos — null/ausente
   * significa "nunca visitou" (todo aviso existente conta como não visto). Usado só para
   * decidir o indicador de "novo aviso" na Dashboard, não controla acesso a nada. */
  ultimoAvisoVistoEm?: string | null;
}

/** Um aviso postado por um administrador para todos os usuários da própria turma —
 * "Quadro de Avisos" (/avisos). Não é escopado por período (como `progresso`): um
 * aviso permanece visível independente da virada de semestre, só some se o admin excluir. */
export interface Aviso {
  id: string;
  turmaId: string;
  titulo: string;
  mensagem: string;
  autorNome: string;
  /** ISO. */
  criadoEm: string;
}

/** Estado de gamificação de um usuário dentro de um período específico — zera a cada novo período em curso. Doc id: "{uid}_{periodoId}". */
export interface ProgressoPeriodo {
  uid: string;
  periodoId: string;
  /** id do selo -> data ISO de quando foi desbloqueado (define também a ordem de "últimas conquistas"). */
  selos: Record<string, string>;
  /** ids de avaliação que já concederam o bônus de +50 XP neste período (evita conceder de novo ao desmarcar/remarcar). */
  atividadesBonificadas: string[];
  /** ids de disciplina que já concederam o bônus de +200 XP neste período. */
  disciplinasBonificadas: string[];
  /** Quantidade de dias (calendário local) distintos com login neste período — base das conquistas de frequência. */
  diasComLogin: number;
}

/** Um lançamento no extrato de XP vitalício de um usuário — subcoleção `progresso/{uid}/historico`. Nunca editado/apagado, só criado (ledger). */
export interface EventoXp {
  id: string;
  /** ISO. */
  data: string;
  /** Pode ser negativo (ex: desmarcar uma atividade reverte o XP que ela tinha concedido). */
  delta: number;
  motivo: string;
}

export interface EstatisticasDisciplina {
  disciplinaId: string;
  totalAvaliacoes: number;
  concluidas: number;
  pontosDisponiveis: number;
  pontosEarn: number;
  proximaEntrega: Avaliacao | null;
}
