/**
 * Catálogo estático de níveis e selos da gamificação — vive no código (não no Firestore),
 * mesmo espírito dos mapas de labelTipo/getCorTipo já usados no app. Cada usuário só
 * persiste XP + quais ids de selo já desbloqueou; o "significado" de cada um está aqui.
 *
 * Níveis e selos são representados por um ícone do FontAwesome (classe `icone`, ex:
 * 'fa-solid fa-crown') sobre um círculo de cor sólida (`cor`, hex literal) — substituiu
 * o PNG artesanal usado antes (`images/nivel-*.png`/`images/selo-*.png`). `cor` é
 * deliberadamente um hex fixo por item, não uma variável de tema: cada nível/selo precisa
 * de identidade visual própria e estável (a mesma cor sempre que aparecer), igual ao já
 * feito para `getCorTipo`/cores de disciplina — não faz sentido tematizar isso.
 */

export interface DefinicaoNivel {
  nivel: number;
  titulo: string;
  xpMinimo: number;
  icone: string;
  cor: string;
}

/** XP acumulado é vitalício (nunca reseta). Faixas calibradas para o uso real da turma
 * atual (~6.800 XP/semestre num aluno bem engajado, entrando já no meio do curso) —
 * "Reformador" fica alcançável em ~2 semestres consistentes, não numa jornada de anos. */
export const NIVEIS: DefinicaoNivel[] = [
  { nivel: 1, titulo: 'Catecúmeno', xpMinimo: 0, icone: 'fa-solid fa-seedling', cor: '#16a34a' },
  { nivel: 2, titulo: 'Discípulo', xpMinimo: 800, icone: 'fa-solid fa-shoe-prints', cor: '#2563eb' },
  { nivel: 3, titulo: 'Bereano', xpMinimo: 2000, icone: 'fa-solid fa-magnifying-glass', cor: '#7c3aed' },
  { nivel: 4, titulo: 'Exegeta', xpMinimo: 4000, icone: 'fa-solid fa-pen-nib', cor: '#0891b2' },
  { nivel: 5, titulo: 'Teólogo', xpMinimo: 7000, icone: 'fa-solid fa-graduation-cap', cor: '#d97706' },
  { nivel: 6, titulo: 'Reformador', xpMinimo: 11000, icone: 'fa-solid fa-crown', cor: '#dc2626' },
];

export function nivelPorXp(xp: number): DefinicaoNivel {
  return [...NIVEIS].reverse().find(n => xp >= n.xpMinimo) ?? NIVEIS[0];
}

/** null quando já está no nível máximo (Reformador) — XP continua subindo, só não há próximo título. */
export function proximoNivel(xp: number): DefinicaoNivel | null {
  return NIVEIS.find(n => n.xpMinimo > xp) ?? null;
}

export type CategoriaSelo = 'inicio' | 'frequencia' | 'progresso' | 'disciplina';

export interface DefinicaoSelo {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaSelo;
  icone: string;
  cor: string;
}

/** Todos os selos são por período — zeram a cada novo semestre em curso (ver GamificacaoService). */
export const SELOS: DefinicaoSelo[] = [
  { id: 'bem_vindo', titulo: 'Bem-vindo', descricao: 'Fez login neste semestre.', categoria: 'inicio', icone: 'fa-solid fa-door-open', cor: '#0ea5e9' },
  { id: 'primeira_vitoria', titulo: 'Primeira Vitória', descricao: 'Concluiu a primeira atividade do semestre.', categoria: 'inicio', icone: 'fa-solid fa-star', cor: '#f59e0b' },
  { id: 'uma_semana', titulo: 'Uma Semana Organizado', descricao: 'Fez login em 7 dias diferentes neste semestre.', categoria: 'frequencia', icone: 'fa-solid fa-calendar-check', cor: '#14b8a6' },
  { id: 'habito_criado', titulo: 'Hábito Criado', descricao: 'Fez login em 30 dias diferentes neste semestre.', categoria: 'frequencia', icone: 'fa-solid fa-fire', cor: '#f97316' },
  { id: 'progresso_1', titulo: 'Primeiro Passo', descricao: 'Alcançou 1% do semestre.', categoria: 'progresso', icone: 'fa-solid fa-flag', cor: '#64748b' },
  { id: 'progresso_10', titulo: 'Primeiros Frutos', descricao: 'Alcançou 10% do semestre.', categoria: 'progresso', icone: 'fa-solid fa-apple-whole', cor: '#22c55e' },
  { id: 'progresso_25', titulo: 'Disciplina em Construção', descricao: 'Alcançou 25% do semestre.', categoria: 'progresso', icone: 'fa-solid fa-hammer', cor: '#b45309' },
  { id: 'progresso_50', titulo: 'Perseverando', descricao: 'Alcançou 50% do semestre.', categoria: 'progresso', icone: 'fa-solid fa-person-hiking', cor: '#3b82f6' },
  { id: 'progresso_75', titulo: 'Perseverança Confirmada', descricao: 'Alcançou 75% do semestre.', categoria: 'progresso', icone: 'fa-solid fa-medal', cor: '#8b5cf6' },
  { id: 'progresso_90', titulo: 'Quase no Fim', descricao: 'Alcançou 90% do semestre.', categoria: 'progresso', icone: 'fa-solid fa-hourglass-end', cor: '#f43f5e' },
  { id: 'progresso_100', titulo: 'Semestre Concluído', descricao: 'Concluiu 100% das atividades do semestre.', categoria: 'progresso', icone: 'fa-solid fa-trophy', cor: '#eab308' },
  { id: 'disciplina_concluida', titulo: 'Disciplina Concluída', descricao: 'Concluiu todas as atividades de uma disciplina.', categoria: 'disciplina', icone: 'fa-solid fa-graduation-cap', cor: '#6366f1' },
];

/** Marcos de % que valem um selo — e quais também dão bônus de XP (só o de 100%, ver GamificacaoService). */
export const MARCOS_PROGRESSO: { percentual: number; seloId: string }[] = [
  { percentual: 1, seloId: 'progresso_1' },
  { percentual: 10, seloId: 'progresso_10' },
  { percentual: 25, seloId: 'progresso_25' },
  { percentual: 50, seloId: 'progresso_50' },
  { percentual: 75, seloId: 'progresso_75' },
  { percentual: 90, seloId: 'progresso_90' },
  { percentual: 100, seloId: 'progresso_100' },
];

export function seloPorId(id: string): DefinicaoSelo | undefined {
  return SELOS.find(s => s.id === id);
}
