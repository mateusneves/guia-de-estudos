export interface Avaliacao {
  id: string;
  disciplinaId: string;
  descricao: string;
  data: string | null; // ISO date string or null for continuous
  dataDisplay: string; // Human-readable date
  pontos: number;
  tipo: 'prova' | 'trabalho' | 'leitura' | 'continuo' | 'teste' | 'projeto' | 'declaracao';
  concluida?: boolean;
}

export interface Disciplina {
  id: string;
  codigo: string;
  nome: string;
  nomeCompleto: string;
  cor: string;
  corTexto: string;
  conteudoProgramatico: { unidade: string; descricao: string }[];
  avaliacoes: Avaliacao[];
  bibliografia: string[];
}

export interface AulaHorario {
  dia: string;
  modulo: string;
  horario: string;
  disciplinaId: string;
  disciplina: string;
}

export interface EstatisticasDisciplina {
  disciplinaId: string;
  totalAvaliacoes: number;
  concluidas: number;
  pontosDisponiveis: number;
  pontosEarn: number;
  proximaEntrega: Avaliacao | null;
}
