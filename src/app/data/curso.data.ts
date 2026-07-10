// Fonte histórica dos dados do semestre "3º Ano · 1º Semestre 2026".
// Não é mais importado pelo app em runtime (os dados vivem no Firestore) —
// serve apenas de entrada para o script de seed (scripts/seed-firestore.ts).

interface SeedAulaHorario {
  dia: string;
  modulo: string;
  horario: string;
}

interface SeedAvaliacao {
  id: string;
  disciplinaId: string;
  descricao: string;
  data: string | null;
  dataDisplay: string;
  pontos: number;
  tipo: string;
}

interface SeedDisciplina {
  id: string;
  codigo: string;
  nome: string;
  nomeCompleto: string;
  cor: string;
  corTexto: string;
  conteudoProgramatico: { unidade: string; descricao: string }[];
  avaliacoes: SeedAvaliacao[];
  bibliografia: string[];
  horarios: SeedAulaHorario[];
}

export const DISCIPLINAS: SeedDisciplina[] = [
  {
    id: 'tp03',
    codigo: 'TP03',
    nome: 'Aconselhamento 1',
    nomeCompleto: 'TP03 - Aconselhamento 1',
    cor: '#1e40af',
    corTexto: '#ffffff',
    horarios: [
      { dia: 'Quinta', modulo: 'M2', horario: '08:50 às 10:30' },
    ],
    conteudoProgramatico: [
      { unidade: 'Unidade 1', descricao: 'O ministério da palavra: pregação, ensino e aconselhamento e História do Aconselhamento Bíblico.' },
      { unidade: 'Unidade 2', descricao: 'O que faz o aconselhamento ser Bíblico? Características da igreja conselheira.' },
      { unidade: 'Unidade 3', descricao: 'O perfil do conselheiro bíblico e O conselheiro como capelão.' },
      { unidade: 'Unidade 4', descricao: 'O uso das Escrituras no aconselhamento (suficiência, uso e alvo).' },
      { unidade: 'Unidade 5', descricao: 'O conceito bíblico de coração e Antropologia aplicada ao aconselhamento.' },
      { unidade: 'Unidade 6', descricao: 'A dinâmica da mudança bíblica.' },
      { unidade: 'Unidade 7', descricao: 'Visão bíblica da doença. Uma perspectiva bíblica da autoimagem, autoestima e amor-próprio.' },
      { unidade: 'Unidade 8', descricao: 'Uma visão bíblica do passado.' },
      { unidade: 'Unidade 9', descricao: 'Verdades básicas do casamento.' },
    ],
    avaliacoes: [
      { id: 'tp03-1', disciplinaId: 'tp03', descricao: 'Leituras e Declaração — "A Utilidade das Escrituras no Aconselhamento" (Wayne Mack), "Meus Cinco Objetivos..." (Robert Jones), "Por que Aconselhar" e "Pastores Psicanalistas?" (Pr Emídio)', data: '2026-03-05', dataDisplay: '05/03/2026', pontos: 10, tipo: 'declaracao' },
      { id: 'tp03-2', disciplinaId: 'tp03', descricao: 'Declaração de leitura (em sala) — "Mas afinal, o que é Aconselhamento Bíblico" (Edward T. Welch)', data: '2026-03-12', dataDisplay: '12/03/2026', pontos: 5, tipo: 'declaracao' },
      { id: 'tp03-3', disciplinaId: 'tp03', descricao: 'Declaração de leitura (em sala) — Introdução ao Aconselhamento Bíblico (MacArthur), págs. 1-64', data: '2026-04-23', dataDisplay: '23/04/2026', pontos: 17, tipo: 'declaracao' },
      { id: 'tp03-4', disciplinaId: 'tp03', descricao: 'Declaração de leitura (em sala) — Introdução ao Aconselhamento Bíblico (MacArthur), págs. 65-113', data: '2026-05-21', dataDisplay: '21/05/2026', pontos: 18, tipo: 'declaracao' },
      { id: 'tp03-5', disciplinaId: 'tp03', descricao: 'Participação nos Cultos às quartas-feiras na capela', data: null, dataDisplay: 'Contínuo', pontos: 10, tipo: 'continuo' },
      { id: 'tp03-6', disciplinaId: 'tp03', descricao: 'Avaliação Final', data: '2026-06-25', dataDisplay: '25/06/2026', pontos: 40, tipo: 'prova' },
    ],
    bibliografia: [
      'Macarthur, John F. Jr. Introdução ao Aconselhamento Bíblico. São Paulo: Editora Hagnos, 2004.',
    ],
  },
  {
    id: 'ts12',
    codigo: 'TS12',
    nome: 'Cosmovisão Calvinista',
    nomeCompleto: 'TS12 - Cosmovisão Calvinista',
    cor: '#7c3aed',
    corTexto: '#ffffff',
    horarios: [
      { dia: 'Segunda', modulo: 'M2', horario: '08:50 às 10:30' },
    ],
    conteudoProgramatico: [
      { unidade: 'Unidade 1', descricao: 'O que é cosmovisão.' },
      { unidade: 'Unidade 2', descricao: 'Funções de uma cosmovisão.' },
      { unidade: 'Unidade 3', descricao: 'História do estudo das cosmovisões.' },
      { unidade: 'Unidade 4', descricao: 'Cosmovisões seculares (Deísmo, Naturalismo, Niilismo, Existencialismo, Nova Era, Pós-Modernismo).' },
      { unidade: 'Unidade 5', descricao: 'Cosmovisões comparadas 1: De Deus e do mundo.' },
      { unidade: 'Unidade 6', descricao: 'Cosmovisões comparadas 2: De Deus e do homem.' },
      { unidade: 'Unidade 7', descricao: 'Cosmovisões comparadas 3: Ética e conceito do mal.' },
      { unidade: 'Unidade 8', descricao: 'Fundamentos da cosmovisão reformada: criação.' },
      { unidade: 'Unidade 9', descricao: 'Fundamentos da cosmovisão reformada: queda.' },
      { unidade: 'Unidade 10', descricao: 'Fundamentos da cosmovisão reformada: redenção e consumação.' },
      { unidade: 'Unidade 11', descricao: 'O mandato cultural na fé reformada.' },
      { unidade: 'Unidade 12', descricao: 'O cristão e a educação.' },
      { unidade: 'Unidade 13', descricao: 'O cristão e a ciência.' },
      { unidade: 'Unidade 14', descricao: 'O cristão e as artes.' },
      { unidade: 'Unidade 15', descricao: 'O cristão e a política.' },
    ],
    avaliacoes: [
      { id: 'ts12-1', disciplinaId: 'ts12', descricao: 'Teste (abrangendo até a unidade 11)', data: '2026-05-04', dataDisplay: '04/05/2026', pontos: 20, tipo: 'teste' },
      { id: 'ts12-2', disciplinaId: 'ts12', descricao: 'Prova final (toda a matéria + questões sobre Wiker & Witt)', data: '2026-06-22', dataDisplay: '22/06/2026', pontos: 30, tipo: 'prova' },
      { id: 'ts12-3', disciplinaId: 'ts12', descricao: 'Diário de aprendizagem (entrega a cada cinco unidades, manuscrito e escaneado)', data: null, dataDisplay: 'Contínuo', pontos: 20, tipo: 'continuo' },
      { id: 'ts12-4', disciplinaId: 'ts12', descricao: 'Trabalho em grupo — Investigação de fenômeno cultural (6 a 7 laudas)', data: '2026-06-01', dataDisplay: '01/06/2026', pontos: 20, tipo: 'trabalho' },
      { id: 'ts12-5', disciplinaId: 'ts12', descricao: 'Declaração de leitura do livro obrigatório (Wiker & Witt)', data: '2026-06-22', dataDisplay: 'Data da Prova Final', pontos: 10, tipo: 'declaracao' },
    ],
    bibliografia: [
      'WIKER, Benjamin; WITT, Jonathan. Um mundo com significado: Como as artes e as ciências revelam o gênio da natureza. (Leitura Obrigatória).',
      'Bavinck, Herman. Cosmovisão cristã. Brasília, DF: Monergismo, 2024.',
      'Colson, Charles; Pearcey, Nancy. E agora, como viveremos? Rio de Janeiro, RJ: CPAD, 2000.',
    ],
  },
  {
    id: 'th52',
    codigo: 'TH52',
    nome: 'Desafios Missionários Contemporâneos',
    nomeCompleto: 'TH52 - Desafios Missionários Contemporâneos',
    cor: '#059669',
    corTexto: '#ffffff',
    horarios: [],
    conteudoProgramatico: [
      { unidade: 'Unidade 1 (09/02)', descricao: 'Apresentações gerais e Introdução ao Curso.' },
      { unidade: 'Unidade 2 (09/02)', descricao: 'A dimensão Teórica: O Desafio conceitual da Missão.' },
      { unidade: 'Unidade 3 (09/02)', descricao: 'A dimensão Étnica: O desafio das etnias e culturas na Missão.' },
      { unidade: 'Unidade 4 (10/02)', descricao: 'O aspecto Histórico: Aprendendo com os erros e acertos na história das Missões.' },
      { unidade: 'Unidade 5 (10/02)', descricao: 'A vertente Geográfica: O desafio demográfico, social e urbano da missão.' },
      { unidade: 'Unidade 6 (10/02)', descricao: 'O viés Linguístico: O desafio contextual da Missão.' },
      { unidade: 'Unidade 7 (11/02)', descricao: 'A Religiosidade e os desafios espirituais na Missão.' },
      { unidade: 'Unidade 8 (11/02)', descricao: 'A dimensão "Legislativa": Os desafios políticos da Missão.' },
      { unidade: 'Unidade 9 (11/02)', descricao: 'A dimensão Epistemológica: O desafio antropológico da Missão.' },
      { unidade: 'Unidade 10 (12/02)', descricao: 'A dimensão Estratégica: O desafio Prático da Missão (1).' },
      { unidade: 'Unidade 11 (12/02)', descricao: 'A dimensão Estratégica: O desafio Prático da Missão (2).' },
      { unidade: 'Unidades 12-14 (12 e 13/02)', descricao: 'Apresentação de Trabalhos (Grupos 1 a 6).' },
      { unidade: 'Unidade 15 (13/02)', descricao: 'Avaliação Final.' },
    ],
    avaliacoes: [
      { id: 'th52-1', disciplinaId: 'th52', descricao: 'Presença e Participação', data: null, dataDisplay: 'Contínuo', pontos: 10, tipo: 'continuo' },
      { id: 'th52-2', disciplinaId: 'th52', descricao: 'Leitura — Missões: o desafio continua (Lidorio)', data: '2026-04-10', dataDisplay: '10/04/2026', pontos: 20, tipo: 'leitura' },
      { id: 'th52-3', disciplinaId: 'th52', descricao: 'Prova Final (intensivo)', data: '2026-02-13', dataDisplay: '13/02/2026', pontos: 40, tipo: 'prova' },
      { id: 'th52-4', disciplinaId: 'th52', descricao: 'Trabalho em grupo (intensivo)', data: '2026-02-12', dataDisplay: '12/02/2026', pontos: 30, tipo: 'trabalho' },
    ],
    bibliografia: [
      'LIDORIO, Ronaldo. Missões: o desafio continua. Belo Horizonte: Betânia, 2003.',
      'Johnstone, Patrick. O futuro da igreja global. São Paulo: Cultura Cristã, 2017.',
      'Wright, Christopher J. H. A Missão do Povo de Deus. São Paulo: Vida Nova, 2012.',
    ],
  },
  {
    id: 'te17',
    codigo: 'TE17',
    nome: 'Exegese do Antigo Testamento 1',
    nomeCompleto: 'TE17 - Exegese do Antigo Testamento 1',
    cor: '#b45309',
    corTexto: '#ffffff',
    horarios: [
      { dia: 'Terça', modulo: 'M1', horario: '07:00 às 08:40' },
    ],
    conteudoProgramatico: [
      { unidade: 'Unidade 1', descricao: 'Introdução ao Pentateuco (Conceito, Ferramentas, Trabalho escrito).' },
      { unidade: 'Unidades 2-3', descricao: 'Análise contextual: contexto histórico (Cultural, político, econômico, religioso).' },
      { unidade: 'Unidades 4-5', descricao: 'Análise contextual: contexto literário (Todo o livro, remoto, próximo).' },
      { unidade: 'Unidade 6', descricao: 'Análise contextual: contexto canônico.' },
      { unidade: 'Unidades 7-12', descricao: 'Análise textual (Definição da perícope, tradução, crítica textual, manuscritologia, análise do discurso, mensagem para a época).' },
      { unidade: 'Unidades 13-14', descricao: 'Análise teológica (Mensagem para hoje, contribuição para teologias bíblica, sistemática e prática).' },
      { unidade: 'Unidade 15', descricao: 'Conclusão.' },
    ],
    avaliacoes: [
      { id: 'te17-1', disciplinaId: 'te17', descricao: 'Seleção e tradução da Perícope (Inclui tradução literal/dinâmica e justificativa de divisão)', data: '2026-03-17', dataDisplay: '17/03/2026', pontos: 20, tipo: 'trabalho' },
      { id: 'te17-2', disciplinaId: 'te17', descricao: 'Análise Contextual (Conforme diretrizes da Metodologia da Pesquisa Exegética)', data: '2026-04-14', dataDisplay: '14/04/2026', pontos: 20, tipo: 'trabalho' },
      { id: 'te17-3', disciplinaId: 'te17', descricao: 'Análise Textual (Realizada em sala de aula)', data: '2026-06-02', dataDisplay: '02/06/2026', pontos: 40, tipo: 'prova' },
      { id: 'te17-4', disciplinaId: 'te17', descricao: 'Análise Teológica (Parte final e entrega do trabalho completo)', data: '2026-06-23', dataDisplay: '23/06/2026', pontos: 20, tipo: 'trabalho' },
    ],
    bibliografia: [
      'FEE, Gordon D. e STUART, Douglas. Manual de exegese bíblica: Antigo e Novo Testamentos. São Paulo: Vida Nova, 2008.',
    ],
  },
  {
    id: 'te20',
    codigo: 'TE20',
    nome: 'Exegese do Novo Testamento 1',
    nomeCompleto: 'TE20 - Exegese do Novo Testamento 1',
    cor: '#0891b2',
    corTexto: '#ffffff',
    horarios: [
      { dia: 'Quarta', modulo: 'M1', horario: '07:00 às 08:40' },
    ],
    conteudoProgramatico: [
      { unidade: 'Unidade 1', descricao: 'Introdução ao curso.' },
      { unidade: 'Unidades 2-3', descricao: 'Análise de João 1.1-18 e João 1.19-51.' },
      { unidade: 'Unidades 4-6', descricao: 'Análise de João 2.1–4.54 (Inclui leituras de Carson).' },
      { unidade: 'Unidades 7-8', descricao: 'Análise de João 5.1–7.52; 6.26-40 (Estrutura, esboço de sermão, teologia).' },
      { unidade: 'Unidade 9', descricao: 'Análise de João 11.1–12.50.' },
      { unidade: 'Unidades 10-14', descricao: 'Análise de João 13.1–20.31.' },
      { unidade: 'Unidade 15', descricao: 'Análise de João 21.1-25 (Epílogo).' },
    ],
    avaliacoes: [
      { id: 'te20-1', disciplinaId: 'te20', descricao: 'Tradução da Perícope (Delimitação e justificativa da delimitação)', data: '2026-03-18', dataDisplay: '18/03/2026', pontos: 20, tipo: 'trabalho' },
      { id: 'te20-2', disciplinaId: 'te20', descricao: 'Análise contextual (Histórico, literário e canônico)', data: '2026-04-15', dataDisplay: '15/04/2026', pontos: 20, tipo: 'trabalho' },
      { id: 'te20-3', disciplinaId: 'te20', descricao: 'Análise textual (Palavras-chave, crítica textual, estruturação de cláusulas, mensagem para a época)', data: '2026-06-03', dataDisplay: '03/06/2026', pontos: 40, tipo: 'prova' },
      { id: 'te20-4', disciplinaId: 'te20', descricao: 'Análise teológica (Mensagem para hoje, esboço do sermão e trabalho final)', data: '2026-06-17', dataDisplay: '17/06/2026', pontos: 20, tipo: 'trabalho' },
    ],
    bibliografia: [
      'CARSON, D. A. O Comentário de João. São Paulo: Shedd Publicações, 2007.',
      'HENDRIKSEN, William. João. São Paulo: Cultura Cristã, 2004.',
      'BLOMBERG, Craig L. Introdução ao Novo Testamento: Evangelhos. São Paulo: Vida Nova, 2019.',
    ],
  },
  {
    id: 'th04',
    codigo: 'TH04',
    nome: 'História da Igreja 4',
    nomeCompleto: 'TH04 - História da Igreja 4',
    cor: '#be185d',
    corTexto: '#ffffff',
    horarios: [
      { dia: 'Quarta', modulo: 'M3', horario: '10:40 às 12:20' },
      { dia: 'Sexta', modulo: 'M3', horario: '10:40 às 12:20' },
    ],
    conteudoProgramatico: [
      { unidade: 'Semana 1', descricao: 'Correntes Intelectuais do Séc. 18 (Racionalismo, Iluminismo, Deísmo).' },
      { unidade: 'Semana 2', descricao: 'Espiritualismo (Boehme, Fox) e o Pietismo (Spener, Francke, Missão Halle).' },
      { unidade: 'Semana 3', descricao: 'O Protestantismo na Inglaterra no Séc. 18 (Puritanismo, Avivamento, Wesley e Whitefield).' },
      { unidade: 'Semana 4', descricao: 'O Protestantismo na Escócia e Irlanda no Séc. 18 (Pactuantes). O Catolicismo na Europa.' },
      { unidade: 'Semana 5', descricao: 'O Protestantismo Continental e Inglês no Séc. 19 (Movimentos Liberal, Anglo-Católico).' },
      { unidade: 'Semana 6', descricao: 'O Protestantismo na Inglaterra (Darby, Spurgeon) e Escócia no Séc. 19.' },
      { unidade: 'Semanas 7 a 9', descricao: 'Apresentação de trabalhos sobre Missões (América do Norte, África, América Latina, Ásia, Oceania).' },
      { unidade: 'Semana 10', descricao: 'Os Avivamentos Norte-Americanos (Edwards, Finney, Moody).' },
      { unidade: 'Semana 11', descricao: 'O Cristianismo nos EUA no Séc. 20 (Controvérsia Modernista-Fundamentalista, Pentecostalismo).' },
      { unidade: 'Semana 12', descricao: 'O Catolicismo e Protestantismo na América Latina no Séc. 20.' },
      { unidade: 'Semana 13', descricao: 'Os Novos Rumos da Igreja no Séc. 20 (Ecumenismo, Nazismo, Lausanne, Ideologias).' },
    ],
    avaliacoes: [
      { id: 'th04-1', disciplinaId: 'th04', descricao: 'Pesquisas em duplas apresentadas em sala e trabalho escrito', data: null, dataDisplay: 'Semana de aula (contínuo)', pontos: 15, tipo: 'trabalho' },
      { id: 'th04-2', disciplinaId: 'th04', descricao: 'Trabalho em grupo sobre Missões (Escrito e apresentado) — Semanas 7 a 9', data: null, dataDisplay: '7ª à 9ª semana', pontos: 35, tipo: 'trabalho' },
      { id: 'th04-3', disciplinaId: 'th04', descricao: 'Avaliação final — Mapa mental e linha do tempo (todos os alunos)', data: '2026-06-17', dataDisplay: '17 e 19/06/2026', pontos: 25, tipo: 'prova' },
      { id: 'th04-4', disciplinaId: 'th04', descricao: 'Participação em sala', data: null, dataDisplay: 'Contínuo', pontos: 5, tipo: 'continuo' },
      { id: 'th04-5', disciplinaId: 'th04', descricao: 'Declaração de leitura e resumo de Cristianismo e Liberalismo (Machen)', data: null, dataDisplay: 'Última semana', pontos: 20, tipo: 'declaracao' },
    ],
    bibliografia: [
      'CAIRNS, Early E. O Cristianismo através dos Séculos. São Paulo: Vida Nova, 2008.',
      'MACHEN, J. Gresham. Cristianismo e Liberalismo. São Paulo: Shedd, 2016.',
    ],
  },
  {
    id: 'th07',
    codigo: 'TH07',
    nome: 'História do Pensamento Cristão 1',
    nomeCompleto: 'TH07 - História do Pensamento Cristão 1',
    cor: '#64748b',
    corTexto: '#ffffff',
    horarios: [
      { dia: 'Terça', modulo: 'M3', horario: '10:40 às 12:20' },
    ],
    conteudoProgramatico: [
      { unidade: 'Unidade 1', descricao: 'Os pais da Igreja (Resposta aos gregos, formação teológica, legados).' },
      { unidade: 'Unidade 2', descricao: 'Movimentos heréticos.' },
      { unidade: 'Unidade 3', descricao: 'A controvérsia ariana e o Concílio de Niceia.' },
      { unidade: 'Unidade 4', descricao: 'O problema Cristológico (Antioquia, Alexandria, Nestório, Cirilo, Éfeso, Calcedônia).' },
      { unidade: 'Unidade 5', descricao: 'Agostinho (Biografia, escritos e influência).' },
      { unidade: 'Unidade 6', descricao: 'O monasticismo (Origens, desenvolvimento e expoentes).' },
      { unidade: 'Unidade 7', descricao: 'O Escolasticismo (Querela dos Universais, Tomás de Aquino, método escolástico).' },
      { unidade: 'Unidade 8', descricao: 'O misticismo (Bernardo de Clairvaux, misticismo germânico).' },
      { unidade: 'Unidade 9', descricao: 'O Pensamento da Pré Reforma (Movimentos e nomes principais).' },
      { unidade: 'Unidade 10', descricao: 'O Pensamento Reformador (Influências, Lutero e Calvino).' },
    ],
    avaliacoes: [
      { id: 'th07-1', disciplinaId: 'th07', descricao: '1º Questionário sobre a matéria', data: '2026-04-28', dataDisplay: '28/04/2026', pontos: 15, tipo: 'teste' },
      { id: 'th07-2', disciplinaId: 'th07', descricao: 'Avaliação de leitura de livro (Estudo Dirigido)', data: '2026-05-20', dataDisplay: '20/05/2026', pontos: 30, tipo: 'leitura' },
      { id: 'th07-3', disciplinaId: 'th07', descricao: '2º Questionário sobre a matéria', data: '2026-06-10', dataDisplay: '10/06/2026', pontos: 15, tipo: 'teste' },
      { id: 'th07-4', disciplinaId: 'th07', descricao: 'Elaboração de Texto (25 linhas) sobre tema da matéria', data: null, dataDisplay: 'Última aula', pontos: 10, tipo: 'trabalho' },
      { id: 'th07-5', disciplinaId: 'th07', descricao: 'Exame final (Todo o conteúdo do semestre)', data: null, dataDisplay: 'Semana de provas', pontos: 30, tipo: 'prova' },
    ],
    bibliografia: [
      'MCGRATH, Alister E. Teologia Sistemática, História e Filosófica. Shedd Publicações, 2005.',
      'GONZÁLEZ, Justo L. Uma história do pensamento cristão. (3 vols.). São Paulo: Cultura Cristã, 2004.',
      'LITFIN, Bryan M. Conhecendo os pais da igreja. São Paulo: Vida Nova, 2015. (Leitura Complementar).',
    ],
  },
  {
    id: 'cg12',
    codigo: 'CG12',
    nome: 'Monografia 1',
    nomeCompleto: 'CG12 - Monografia 1',
    cor: '#0f766e',
    corTexto: '#ffffff',
    horarios: [
      { dia: 'Sexta', modulo: 'M2', horario: '08:50 às 10:30' },
    ],
    conteudoProgramatico: [
      { unidade: 'Unidade 1', descricao: 'Projeto de Pesquisa: pesquisa prévia, determinação do tema e enquadramento na CFW.' },
      { unidade: 'Unidade 2', descricao: 'Pesquisa bibliográfica: técnicas de pesquisa, anotações, fichamentos e atividades práticas na biblioteca.' },
      { unidade: 'Unidade 3', descricao: 'Estrutura da monografia: regras gerais da ABNT e padrão IPB, citações, referências e plágio.' },
      { unidade: 'Unidade 4', descricao: 'Redação do texto: orientações sobre estilo, clareza e linguagem impessoal.' },
    ],
    avaliacoes: [
      { id: 'cg12-1', disciplinaId: 'cg12', descricao: 'Projeto — Etapa 1: Delimitação do assunto', data: '2026-02-21', dataDisplay: '21/02/2026', pontos: 10, tipo: 'projeto' },
      { id: 'cg12-2', disciplinaId: 'cg12', descricao: 'Projeto — Etapa 2: Elaboração do problema e hipótese', data: '2026-03-14', dataDisplay: '14/03/2026', pontos: 10, tipo: 'projeto' },
      { id: 'cg12-3', disciplinaId: 'cg12', descricao: 'Projeto — Etapa 3: Fechamento do referencial teórico', data: '2026-04-18', dataDisplay: '18/04/2026', pontos: 20, tipo: 'projeto' },
      { id: 'cg12-4', disciplinaId: 'cg12', descricao: 'Fichamento de pré-pesquisa — Parte 1 (Mínimo 5 referências)', data: '2026-04-25', dataDisplay: '25/04/2026', pontos: 15, tipo: 'trabalho' },
      { id: 'cg12-5', disciplinaId: 'cg12', descricao: 'Projeto — Etapa 4: Justificativa, objetivos e metodologia', data: '2026-05-09', dataDisplay: '09/05/2026', pontos: 10, tipo: 'projeto' },
      { id: 'cg12-6', disciplinaId: 'cg12', descricao: 'Projeto — Etapa 5: Esboço de sumário, explicação dos capítulos e referências', data: '2026-06-04', dataDisplay: '04/06/2026', pontos: 10, tipo: 'projeto' },
      { id: 'cg12-7', disciplinaId: 'cg12', descricao: 'Fichamento de pré-pesquisa — Parte 2 (Mínimo 5 referências)', data: '2026-06-20', dataDisplay: '20/06/2026', pontos: 15, tipo: 'trabalho' },
      { id: 'cg12-8', disciplinaId: 'cg12', descricao: 'Entrega final do Projeto de Pesquisa', data: '2026-06-27', dataDisplay: '27/06/2026', pontos: 10, tipo: 'projeto' },
    ],
    bibliografia: [
      'AZEVEDO, Israel Belo de. O Prazer da Produção Científica. São Paulo: Hagnos, 2001.',
      'ECO, Umberto. Como Se Faz Uma Tese. São Paulo: Perspectiva, 1991.',
    ],
  },
  {
    id: 'cg64',
    codigo: 'CG64',
    nome: 'Psicopatologia',
    nomeCompleto: 'CG64 - Psicopatologia',
    cor: '#dc2626',
    corTexto: '#ffffff',
    horarios: [
      { dia: 'Segunda', modulo: 'M3', horario: '10:40 às 12:20' },
    ],
    conteudoProgramatico: [
      { unidade: 'Unidade 1', descricao: 'História dos estudos psicopatológicos (Modelos sobrenatural, biológico e psicológico).' },
      { unidade: 'Unidade 2', descricao: 'Classificação estrutural do sujeito psíquico (Psicanálise, Behaviorismo, Humanismo, Crítica do Aconselhamento Bíblico).' },
      { unidade: 'Unidade 3', descricao: 'Distúrbios de humor (Depressão, Transtorno afetivo bipolar).' },
      { unidade: 'Unidade 4', descricao: 'Distúrbios de ansiedade (TOC, Pânico, Fobias, Ansiedade generalizada).' },
      { unidade: 'Unidade 5', descricao: 'Como lidar com ameaças de suicídio.' },
      { unidade: 'Unidade 6', descricao: 'Saúde emocional do pastor (O pastor como passível de afetação emocional).' },
    ],
    avaliacoes: [
      { id: 'cg64-1', disciplinaId: 'cg64', descricao: 'Teste com consulta controlada', data: '2026-05-11', dataDisplay: '11/05/2026', pontos: 20, tipo: 'teste' },
      { id: 'cg64-2', disciplinaId: 'cg64', descricao: 'Diário de aprendizagem (Mapa do aprendizado, dificuldades e reflexões) — entrega ao final de cada unidade', data: null, dataDisplay: 'Final de cada Unidade', pontos: 20, tipo: 'continuo' },
      { id: 'cg64-3', disciplinaId: 'cg64', descricao: 'Relatório de aconselhamento (4 a 5 laudas, caso real anônimo)', data: null, dataDisplay: 'Final do semestre', pontos: 20, tipo: 'trabalho' },
      { id: 'cg64-4', disciplinaId: 'cg64', descricao: 'Prova final (Toda a matéria lecionada)', data: null, dataDisplay: 'Semana de provas', pontos: 30, tipo: 'prova' },
      { id: 'cg64-5', disciplinaId: 'cg64', descricao: 'Panorama sobre livro lido — Declaração de leitura e questões na prova final (A insanidade da loucura — Berger II)', data: null, dataDisplay: 'Semana de provas', pontos: 10, tipo: 'leitura' },
    ],
    bibliografia: [
      'BERGER II, Daniel R. A insanidade da loucura: Definindo a doença mental. Brasília: SEBI, 2023. (Leitura Integral Obrigatória).',
      'APA. Manual Diagnóstico e Estatístico de Transtornos Mentais (DSM-5-TR).',
      'DALGALARRONDO, Paulo. Psicopatologia e Semiologia dos Transtornos Mentais. Porto Alegre: Artmed, 2018.',
    ],
  },
  {
    id: 'cg10',
    codigo: 'CG10',
    nome: 'Sociologia Geral',
    nomeCompleto: 'CG10 - Sociologia Geral',
    cor: '#d97706',
    corTexto: '#ffffff',
    horarios: [
      { dia: 'Quinta', modulo: 'M1', horario: '07:00 às 08:40' },
    ],
    conteudoProgramatico: [
      { unidade: 'Unidade 1', descricao: 'Significado e história da sociologia (Comparação com outras ciências sociais).' },
      { unidade: 'Unidade 2', descricao: 'Sociedade e cultura. As instituições sociais.' },
      { unidade: 'Unidade 3', descricao: 'As normas sociais e a sociedade.' },
      { unidade: 'Unidade 4', descricao: 'A estratificação social.' },
      { unidade: 'Unidade 5', descricao: 'Status e papel na sociedade.' },
      { unidade: 'Unidade 6', descricao: 'Os processos sociais básicos.' },
      { unidade: 'Unidade 7', descricao: 'Os grupos e agregados sociais.' },
      { unidade: 'Unidade 8', descricao: 'Desenvolvimento e mudança social.' },
      { unidade: 'Unidade 9', descricao: 'A igreja e os problemas sociais (Pobreza, Preconceito e educação, Corrupção, Política).' },
    ],
    avaliacoes: [
      { id: 'cg10-1', disciplinaId: 'cg10', descricao: 'Atividade 1 — Atividade crítica em sala guiada com IA sobre Max Weber', data: '2026-03-12', dataDisplay: '12/03/2026', pontos: 15, tipo: 'trabalho' },
      { id: 'cg10-2', disciplinaId: 'cg10', descricao: 'Atividade 2 — Atividade crítica guiada com IA sobre Marxismo e Teologia Reformada', data: '2026-05-07', dataDisplay: '07/05/2026', pontos: 15, tipo: 'trabalho' },
      { id: 'cg10-3', disciplinaId: 'cg10', descricao: '1ª Avaliação — Mini-projeto: O que é ser brasileiro?', data: '2026-05-14', dataDisplay: '14/05/2026', pontos: 30, tipo: 'projeto' },
      { id: 'cg10-4', disciplinaId: 'cg10', descricao: '2ª Avaliação — Mini-projeto: O que é ser brasileiro?', data: '2026-06-25', dataDisplay: '25/06/2026', pontos: 30, tipo: 'projeto' },
      { id: 'cg10-5', disciplinaId: 'cg10', descricao: 'Leitura obrigatória — Biéler, Cap. 3 (O pensamento econômico e social de Calvino)', data: null, dataDisplay: 'Contínuo', pontos: 10, tipo: 'leitura' },
    ],
    bibliografia: [
      'BIÉLER, André. O pensamento econômico e social de Calvino. São Paulo: Cultura Cristã, 2012.',
      'WEBER, Max. A ética protestante e o espírito do capitalismo. São Paulo: Companhia das Letras, 2005.',
    ],
  },
  {
    id: 'tp07',
    codigo: 'TP07',
    nome: 'Teologia de Missões 1',
    nomeCompleto: 'TP07 - Teologia de Missões 1',
    cor: '#0369a1',
    corTexto: '#ffffff',
    horarios: [
      { dia: 'Quinta', modulo: 'M3', horario: '10:40 às 12:20' },
    ],
    conteudoProgramatico: [
      { unidade: 'Unidade 1', descricao: 'Fundamentos Conceituais da Teologia de Missões (Reino de Deus, missio Dei, cosmovisão reformada, trinômio criação-queda-redenção).' },
      { unidade: 'Unidade 2', descricao: 'Visão Panorâmica das Missões no Antigo Testamento (Gênesis, Êxodo, Profetas e Escritos).' },
      { unidade: 'Unidade 3', descricao: 'Visão Panorâmica das Missões no Novo Testamento (Evangelhos, Atos, Epístolas e Escatologia).' },
    ],
    avaliacoes: [
      { id: 'tp07-1', disciplinaId: 'tp07', descricao: 'Exercícios em sala de aula', data: null, dataDisplay: 'Em sala (contínuo)', pontos: 20, tipo: 'continuo' },
      { id: 'tp07-2', disciplinaId: 'tp07', descricao: 'Leitura — Alegrem-se os povos (John Piper)', data: null, dataDisplay: 'Contínuo', pontos: 10, tipo: 'leitura' },
      { id: 'tp07-3', disciplinaId: 'tp07', descricao: 'Resumos das aulas ministradas', data: null, dataDisplay: 'Contínuo', pontos: 10, tipo: 'continuo' },
      { id: 'tp07-4', disciplinaId: 'tp07', descricao: 'Diagnóstico missiológico de uma igreja local', data: null, dataDisplay: 'Sem data fixa', pontos: 20, tipo: 'trabalho' },
      { id: 'tp07-5', disciplinaId: 'tp07', descricao: 'Avaliação escrita final', data: '2026-06-25', dataDisplay: '25/06/2026', pontos: 40, tipo: 'prova' },
    ],
    bibliografia: [
      'PIPER, John. Alegrem-se os povos: a supremacia de Deus em missões. São Paulo: Cultura Cristã, 2001.',
      'BAVINCK, J. H. An introduction to the science of mission. Filadélfia: Presbyterian and Reformed, 1960.',
      'WRIGHT, Christopher J. H. A missão do povo de deus. São Paulo: Vida Nova, 2012.',
    ],
  },
  {
    id: 'tp17',
    codigo: 'TP17',
    nome: 'Prática de Pregação 3',
    nomeCompleto: 'TP17 - Prática de Pregação 3',
    cor: '#9333ea',
    corTexto: '#ffffff',
    horarios: [
      { dia: 'Terça', modulo: 'M2', horario: '08:50 às 10:30' },
    ],
    conteudoProgramatico: [
      { unidade: '—', descricao: 'Conteúdo programático não disponível no plano de curso.' },
    ],
    avaliacoes: [],
    bibliografia: [],
  },
  {
    id: 'pct05',
    codigo: 'PCT05',
    nome: 'Participação em Culto',
    nomeCompleto: 'PCT05 - Participação em Culto',
    cor: '#475569',
    corTexto: '#ffffff',
    horarios: [
      { dia: 'Quarta', modulo: 'M2', horario: '08:50 às 10:30' },
    ],
    conteudoProgramatico: [
      { unidade: '—', descricao: 'Participação nas atividades de culto conforme cronograma institucional.' },
    ],
    avaliacoes: [],
    bibliografia: [],
  },
];
