/**
 * Catálogo estático de temas visuais — vive no código, mesmo espírito de
 * `gamificacao-catalogo.ts`: cada turma só persiste o `temaId` escolhido
 * (`turmas/{turmaId}.temaId`), o "significado" (nome/descrição) e os valores visuais
 * (variáveis CSS em `styles.css`, selecionadas por `[data-tema="<id>"]`) ficam aqui/lá.
 *
 * Para adicionar um tema novo: (1) uma entrada aqui com um `id` novo, (2) um bloco
 * `[data-tema="<id>"] { --cor-...: ...; }` em `src/styles.css` com os mesmos tokens que
 * `:root` já define. Nenhum componente precisa mudar — todos consomem as variáveis CSS,
 * nunca o `id` do tema diretamente.
 */

export interface DefinicaoTema {
  id: string;
  nome: string;
  descricao: string;
}

export const TEMAS: DefinicaoTema[] = [
  { id: 'padrao', nome: 'Padrão', descricao: 'Visual limpo e institucional — o tema original do app.' },
  { id: 'medieval', nome: 'Medieval', descricao: 'Pergaminho, tinta e ouro — inspirado em manuscritos iluminados.' },
  { id: 'moderno', nome: 'Moderno', descricao: 'Preto, branco e verde-limão — visual minimalista e editorial.' },
];

/** "Moderno" é o tema padrão do app (pré-login e para qualquer turma sem `temaId`/com
 * um id desconhecido) — não é mais o primeiro item do array por acaso, é resolvido
 * explicitamente por id para não depender da ordem de `TEMAS`. */
export function temaPorId(id: string | undefined | null): DefinicaoTema {
  return TEMAS.find(t => t.id === id) ?? TEMAS.find(t => t.id === 'moderno') ?? TEMAS[0];
}
