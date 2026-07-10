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
}

export interface Progresso {
  concluidas: string[];
  notas: Record<string, string>;
}

export interface EstatisticasDisciplina {
  disciplinaId: string;
  totalAvaliacoes: number;
  concluidas: number;
  pontosDisponiveis: number;
  pontosEarn: number;
  proximaEntrega: Avaliacao | null;
}
