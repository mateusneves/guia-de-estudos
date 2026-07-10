export interface Avaliacao {
  id: string;
  turmaId: string;
  disciplinaId: string;
  descricao: string;
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

export interface Disciplina {
  id: string;
  turmaId: string;
  codigo: string;
  nome: string;
  nomeCompleto: string;
  cor: string;
  corTexto: string;
  conteudoProgramatico: { unidade: string; descricao: string }[];
  avaliacoes: Avaliacao[];
  bibliografia: string[];
  horarios: AulaHorario[];
}

export type Role = 'aluno' | 'administrador';

export interface Turma {
  id: string;
  nome: string;
  anoSemestre: string;
  ativa: boolean;
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
