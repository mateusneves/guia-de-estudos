/**
 * Catálogo estático de níveis e selos da gamificação — vive no código (não no Firestore),
 * mesmo espírito dos mapas de labelTipo/getCorTipo já usados no app. Cada usuário só
 * persiste XP + quais ids de selo já desbloqueou; o "significado" de cada um está aqui.
 */

export interface DefinicaoNivel {
  nivel: number;
  titulo: string;
  xpMinimo: number;
  imagem: string;
}

/** XP acumulado é vitalício (nunca reseta). Faixas calibradas para o uso real da turma
 * atual (~6.800 XP/semestre num aluno bem engajado, entrando já no meio do curso) —
 * "Reformador" fica alcançável em ~2 semestres consistentes, não numa jornada de anos. */
export const NIVEIS: DefinicaoNivel[] = [
  { nivel: 1, titulo: 'Catecúmeno', xpMinimo: 0, imagem: 'images/nivel-catecumeno.png' },
  { nivel: 2, titulo: 'Discípulo', xpMinimo: 800, imagem: 'images/nivel-discipulo.png' },
  { nivel: 3, titulo: 'Bereano', xpMinimo: 2000, imagem: 'images/nivel-bereano.png' },
  { nivel: 4, titulo: 'Exegeta', xpMinimo: 4000, imagem: 'images/nivel-exegeta.png' },
  { nivel: 5, titulo: 'Teólogo', xpMinimo: 7000, imagem: 'images/nivel-teologo.png' },
  { nivel: 6, titulo: 'Reformador', xpMinimo: 11000, imagem: 'images/nivel-reformador.png' },
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
  imagem: string;
}

/** Todos os selos são por período — zeram a cada novo semestre em curso (ver GamificacaoService). */
export const SELOS: DefinicaoSelo[] = [
  { id: 'bem_vindo', titulo: 'Bem-vindo', descricao: 'Fez login neste semestre.', categoria: 'inicio', imagem: 'images/selo-bem-vindo.png' },
  { id: 'primeira_vitoria', titulo: 'Primeira Vitória', descricao: 'Concluiu a primeira atividade do semestre.', categoria: 'inicio', imagem: 'images/selo-primeira-vitoria.png' },
  { id: 'uma_semana', titulo: 'Uma Semana Organizado', descricao: 'Fez login em 7 dias diferentes neste semestre.', categoria: 'frequencia', imagem: 'images/selo-uma-semana-organizada.png' },
  { id: 'habito_criado', titulo: 'Hábito Criado', descricao: 'Fez login em 30 dias diferentes neste semestre.', categoria: 'frequencia', imagem: 'images/selo-habito-criado.png' },
  { id: 'progresso_1', titulo: 'Primeiro Passo', descricao: 'Alcançou 1% do semestre.', categoria: 'progresso', imagem: 'images/selo-primeiro-passo.png' },
  { id: 'progresso_10', titulo: 'Primeiros Frutos', descricao: 'Alcançou 10% do semestre.', categoria: 'progresso', imagem: 'images/selo-primeiros-frutos.png' },
  { id: 'progresso_25', titulo: 'Disciplina em Construção', descricao: 'Alcançou 25% do semestre.', categoria: 'progresso', imagem: 'images/selo-disciplina-em-construcao.png' },
  { id: 'progresso_50', titulo: 'Perseverando', descricao: 'Alcançou 50% do semestre.', categoria: 'progresso', imagem: 'images/selo-perseverando.png' },
  { id: 'progresso_75', titulo: 'Perseverança Confirmada', descricao: 'Alcançou 75% do semestre.', categoria: 'progresso', imagem: 'images/selo-perseveranca-confirmada.png' },
  { id: 'progresso_90', titulo: 'Quase no Fim', descricao: 'Alcançou 90% do semestre.', categoria: 'progresso', imagem: 'images/selo-quase-no-fim.png' },
  { id: 'progresso_100', titulo: 'Semestre Concluído', descricao: 'Concluiu 100% das atividades do semestre.', categoria: 'progresso', imagem: 'images/selo-semestre-concluido.png' },
  { id: 'disciplina_concluida', titulo: 'Disciplina Concluída', descricao: 'Concluiu todas as atividades de uma disciplina.', categoria: 'disciplina', imagem: 'images/disciplina-concluida.png' },
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
