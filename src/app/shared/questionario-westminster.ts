// Gerado a partir de questionario_westminster.json (fornecido pelo usuário em 2026-07-31) —
// arquivo original veio com problema de encoding (mojibake UTF-8/Latin-1), corrigido antes de
// virar este catálogo. Ver CLAUDE.md "Questionário Diário" para o resto da arquitetura.
export interface QuestaoQuiz {
  id: number;
  capitulo: string;
  pergunta: string;
  alternativas: string[];
  respostaCorreta: string;
  explicacao: string;
}

export const QUESTIONARIO_WESTMINSTER: QuestaoQuiz[] = [
  {
    "id": 1,
    "capitulo": "XXII - Dos Juramentos Legais e dos Votos",
    "pergunta": "Segundo a Seção III, ao prestar um juramento, a pessoa deve obrigar-se:",
    "alternativas": [
      "Por qualquer promessa feita sob pressão social, mesmo sem plena convicção pessoal",
      "Somente por aquilo que é justo e bom, e que tem condições reais e resolução firme de cumprir",
      "Somente diante de testemunhas eclesiásticas, sem necessidade de convicção íntima da verdade",
      "Por qualquer coisa solicitada pela autoridade legal, independentemente de ser justa ou não",
      "Apenas por compromissos religiosos, sendo os civis dispensados dessa exigência de sinceridade"
    ],
    "respostaCorreta": "Somente por aquilo que é justo e bom, e que tem condições reais e resolução firme de cumprir",
    "explicacao": "Seção III: deve-se jurar 'tão somente por aquilo que é justo e bom... e por aquilo que pode e está resolvido a cumprir'."
  },
  {
    "id": 2,
    "capitulo": "XXIX - Da Ceia do Senhor",
    "pergunta": "Segundo a Seção VIII, o que ocorre quando pessoas ignorantes ou ímpias recebem exteriormente os elementos da Ceia?",
    "alternativas": [
      "Anulam automaticamente a validade do sacramento para toda a congregação presente, apesar de soar plausível a uma leitura apressada do capítulo",
      "Recebem apenas uma bênção simbólica menor, sem qualquer consequência espiritual negativa, contrariando o sentido direto do texto citado nessa seção",
      "Ficam isentos de responsabilidade, já que a eficácia do rito não depende do receptor, o que não corresponde à formulação exata usada pela Confissão",
      "Recebem plenamente a graça sacramental, independentemente de sua condição espiritual interior, posição incompatível com o restante do texto confessional",
      "Não recebem a coisa significada, mas, por sua indigna participação, tornam-se réus do corpo e do sangue do Senhor para sua própria condenação"
    ],
    "respostaCorreta": "Não recebem a coisa significada, mas, por sua indigna participação, tornam-se réus do corpo e do sangue do Senhor para sua própria condenação",
    "explicacao": "Seção VIII: os indignos 'não recebem a coisa por eles significada, mas... tornam-se réus do corpo e do sangue do Senhor para a sua própria condenação'."
  },
  {
    "id": 3,
    "capitulo": "XXVIII - Do Batismo",
    "pergunta": "Segundo a Seção V, a Confissão evita afirmar tanto que a regeneração é impossível sem o batismo quanto que todo batizado é necessariamente regenerado. Que erro exatamente essa formulação busca evitar?",
    "alternativas": [
      "A ideia de que o batismo deveria ser repetido sempre que o crente pecar gravemente, divergindo do que a seção afirma de modo explícito, ideia que o texto da Confissão, lido em conjunto, não sustenta",
      "A negação completa de qualquer relação espiritual real entre o sinal e a graça significada, o que não corresponde à formulação exata usada pela Confissão",
      "A afirmação de que o batismo de crianças é ilegítimo, por não haver profissão pessoal de fé, apesar de soar plausível a uma leitura apressada do capítulo",
      "A confusão entre o sinal sacramental e a coisa significada, evitando tanto a negligência do batismo quanto sua absolutização como meio automático de regeneração",
      "A rejeição da validade do batismo administrado por ministros não ordenados formalmente, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo"
    ],
    "respostaCorreta": "A confusão entre o sinal sacramental e a coisa significada, evitando tanto a negligência do batismo quanto sua absolutização como meio automático de regeneração",
    "explicacao": "Seção V evita tanto a negligência do sacramento quanto sua absolutização mágica (regeneração batismal automática): 'a graça e a salvação não se acham tão inseparavelmente ligadas com ela, que sem ela ninguém possa ser regenerado e salvo'."
  },
  {
    "id": 4,
    "capitulo": "XII - Da Adoção",
    "pergunta": "Segundo o Capítulo XII, a graça da adoção concede aos justificados, entre outras coisas, acesso confiante ao trono da graça e o direito de clamar 'Abba, Pai'. Qual afirmação é incompatível com o restante do capítulo?",
    "alternativas": [
      "Os adotados jamais são abandonados por Deus, permanecendo selados para o dia da redenção",
      "Os adotados, uma vez recebidos, nunca mais serão corrigidos ou disciplinados por Deus como um pai corrige seus filhos",
      "Os adotados recebem o Espírito de adoção e são tratados com comiseração, proteção e provisão, como por um pai",
      "Os adotados recebem sobre si o nome de filhos de Deus, gozando da liberdade e dos privilégios que lhes pertencem",
      "Os adotados herdam as promessas, como herdeiros da eterna salvação"
    ],
    "respostaCorreta": "Os adotados, uma vez recebidos, nunca mais serão corrigidos ou disciplinados por Deus como um pai corrige seus filhos",
    "explicacao": "O capítulo afirma expressamente que os adotados 'são tratados com comiseração, protegidos, providos e por ele corrigidos, como por um pai' — a correção paterna continua fazendo parte da adoção."
  },
  {
    "id": 5,
    "capitulo": "XXIV - Do Matrimônio e do Divórcio",
    "pergunta": "Segundo a Seção III, é dever dos cristãos casar somente no Senhor. Qual restrição a Confissão explicitamente recomenda quanto à escolha do cônjuge?",
    "alternativas": [
      "Casar somente com pessoas aprovadas previamente por um concílio eclesiástico regional, ideia que o texto da Confissão, lido em conjunto, não sustenta",
      "Casar apenas após um período mínimo formal de noivado supervisionado pela congregação, ainda que essa leitura seja defendida por outras tradições cristãs",
      "Não casar com infiéis, papistas ou outros idólatras, nem unir-se desigualmente a pessoas notoriamente ímpias ou que sustentem heresias perniciosas",
      "Casar exclusivamente com pessoas da mesma nacionalidade, por razões de estabilidade cultural do lar, posição incompatível com o restante do texto confessional",
      "Casar apenas dentro da própria denominação local, sendo proibido o casamento entre presbiterianos e outros protestantes, o que esvaziaria o sentido pastoral atribuído à seção"
    ],
    "respostaCorreta": "Não casar com infiéis, papistas ou outros idólatras, nem unir-se desigualmente a pessoas notoriamente ímpias ou que sustentem heresias perniciosas",
    "explicacao": "Seção III recomenda não casar com infiéis, papistas ou idólatras, nem unir-se desigualmente a ímpios notórios ou hereges — sem, contudo, proibir o casamento entre denominações protestantes distintas."
  },
  {
    "id": 6,
    "capitulo": "II - De Deus e da Santíssima Trindade",
    "pergunta": "Segundo a Seção III, de quem procede eternamente o Espírito Santo?",
    "alternativas": [
      "Somente do Pai, sendo o Filho apenas testemunha desse ato eterno de procissão",
      "Somente do Filho, recebendo o Pai o Espírito posteriormente por comunicação",
      "Do Pai, do Filho e da Igreja reunida em concílio universal",
      "De si mesmo, de modo absolutamente independente das outras duas pessoas",
      "Do Pai e do Filho"
    ],
    "respostaCorreta": "Do Pai e do Filho",
    "explicacao": "Seção III segue a cláusula filioque: 'o Espírito Santo é eternamente procedente do Pai e do Filho' — o que difere da posição ortodoxa oriental de procissão apenas do Pai."
  },
  {
    "id": 7,
    "capitulo": "XXXII - Do Estado do Homem depois da Morte e da Ressurreição dos Mortos",
    "pergunta": "Segundo a Seção I, além do céu e do inferno para as almas separadas do corpo, quantos outros lugares intermediários as Escrituras reconhecem, segundo a Confissão?",
    "alternativas": [
      "Um lugar específico reservado às crianças não batizadas, distinto do céu e do inferno",
      "Um estado intermediário de sono inconsciente da alma, à espera do juízo final",
      "Um lugar de espera para os que nunca ouviram o Evangelho, distinto dos dois destinos finais",
      "Nenhum outro lugar além destes dois é reconhecido pelas Escrituras",
      "Um terceiro lugar de purificação temporária, para as almas que morrem em estado imperfeito de graça"
    ],
    "respostaCorreta": "Nenhum outro lugar além destes dois é reconhecido pelas Escrituras",
    "explicacao": "Seção I encerra afirmando que, 'além destes dois lugares destinados às almas separadas de seus respectivos corpos as Escrituras não reconhecem nenhum outro lugar' — rejeitando implicitamente a doutrina do purgatório."
  },
  {
    "id": 8,
    "capitulo": "X - Da Vocação Eficaz",
    "pergunta": "Segundo a Seção IV, qual é a posição da Confissão sobre a possibilidade de salvação para os que nunca professam a religião cristã, mesmo vivendo conforme a luz da natureza?",
    "alternativas": [
      "Nega essa possibilidade, considerando 'muito pernicioso e detestável' afirmar que tais pessoas podem ser salvas por outro meio",
      "Deixa a questão em aberto, sem qualquer posicionamento definido sobre o destino eterno dessas pessoas",
      "Afirma que podem ser salvos se viverem de boa consciência segundo a luz da natureza que possuem, apesar de soar plausível a uma leitura apressada do capítulo",
      "Afirma que serão salvos automaticamente, por não terem tido acesso ao Evangelho, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo",
      "Condiciona sua salvação exclusivamente à sinceridade da prática religiosa que seguem, divergindo do que a seção afirma de modo explícito"
    ],
    "respostaCorreta": "Nega essa possibilidade, considerando 'muito pernicioso e detestável' afirmar que tais pessoas podem ser salvas por outro meio",
    "explicacao": "Seção IV rejeita explicitamente a ideia de salvação por fidelidade à luz da natureza fora de Cristo, chamando essa asserção de 'muito perniciosa e detestável'."
  },
  {
    "id": 9,
    "capitulo": "XXV - Da Igreja",
    "pergunta": "Segundo a Seção II, a Igreja Visível sob o Evangelho, em contraste com a Igreja sob a Lei antiga, é caracterizada por:",
    "alternativas": [
      "Não ser restrita a uma única nação, mas abranger todos os que professam a verdadeira religião em todo o mundo, com seus filhos",
      "Coincidir exatamente com a Igreja invisível, sem qualquer possibilidade de mistura ou erro, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo",
      "Excluir formalmente os filhos dos crentes até que professem pessoalmente a fé na idade adulta, ainda que essa leitura seja defendida por outras tradições cristãs",
      "Ser definida exclusivamente por critérios étnicos e territoriais, como a antiga nação de Israel, tal como sustentado por correntes teológicas distintas da reformada",
      "Ser restrita a uma nação eleita específica, do mesmo modo como ocorria sob a antiga aliança, ideia que o texto da Confissão, lido em conjunto, não sustenta"
    ],
    "respostaCorreta": "Não ser restrita a uma única nação, mas abranger todos os que professam a verdadeira religião em todo o mundo, com seus filhos",
    "explicacao": "Seção II: a Igreja Visível sob o Evangelho não é 'restrita a uma nação, como antes sob a Lei', mas abrange todos os que professam a verdadeira religião pelo mundo inteiro, com seus filhos."
  },
  {
    "id": 10,
    "capitulo": "Geral - Nota Histórica",
    "pergunta": "Segundo a Nota Histórica, em qual cidade e local se reuniu a Assembleia de Westminster?",
    "alternativas": [
      "Na Catedral de Notre Dame, em Paris, sob proteção do rei da França",
      "Na Universidade de Oxford, por convocação da Coroa inglesa",
      "No Vaticano, por ocasião de um concílio ecumênico convocado pelo papa",
      "Em uma sala da Abadia de Westminster, em Londres",
      "No Palácio de Genebra, sob a presidência direta de João Calvino"
    ],
    "respostaCorreta": "Em uma sala da Abadia de Westminster, em Londres",
    "explicacao": "Nota Histórica: o Concílio reuniu-se 'em uma das salas da Abadia de Westminster, na cidade de Londres'."
  },
  {
    "id": 11,
    "capitulo": "XXVII - Dos Sacramentos",
    "pergunta": "Segundo o Capítulo XXVII, quantos e quais são os sacramentos ordenados por Cristo no Evangelho, em contraste com o número reconhecido pela tradição católica romana?",
    "alternativas": [
      "Três: o Batismo, a Santa Ceia e a Confirmação",
      "Cinco, excluindo apenas a extrema-unção e a ordem sacerdotal da lista tradicional",
      "Um único sacramento central, do qual o Batismo e a Ceia são apenas expressões simbólicas",
      "Dois: o Batismo e a Santa Ceia",
      "Sete, incluindo confirmação, penitência, unção dos enfermos, ordem e matrimônio"
    ],
    "respostaCorreta": "Dois: o Batismo e a Santa Ceia",
    "explicacao": "Seção IV: 'Há só dois sacramentos ordenados por Cristo, nosso Senhor, no Evangelho - O Batismo e a Santa Ceia' — em contraste com os sete sacramentos da tradição católica romana."
  },
  {
    "id": 12,
    "capitulo": "XXXIII - Do Juízo Final",
    "pergunta": "Segundo a Seção I, além de todas as pessoas que viveram na terra, quem mais comparecerá para ser julgado no dia determinado por Deus?",
    "alternativas": [
      "Somente os seres humanos que morreram sem qualquer forma de fé religiosa declarada",
      "Somente as pessoas que viveram após a primeira vinda de Cristo ao mundo",
      "Os anjos apóstatas",
      "Apenas os líderes religiosos responsáveis pela condução espiritual de cada geração",
      "Nenhum outro ser além dos seres humanos, já que os anjos não estão sujeitos a juízo"
    ],
    "respostaCorreta": "Os anjos apóstatas",
    "explicacao": "Seção I: 'não somente serão julgados os anjos apóstatas, mas também todas as pessoas que tiverem vivido sobre a terra'."
  },
  {
    "id": 13,
    "capitulo": "VII - Do Pacto de Deus com o Homem",
    "pergunta": "Segundo a Seção VI, qual é a relação entre o pacto administrado sob a Lei (Velho Testamento) e o pacto administrado sob o Evangelho (Novo Testamento)?",
    "alternativas": [
      "São o mesmo pacto da graça em substância, variando apenas quanto à forma e ao modo de administração",
      "O pacto do Velho Testamento era de obras, sendo totalmente substituído por um pacto de graça no Novo",
      "São dois pactos distintos e de substância diferente, sendo o segundo uma correção do primeiro",
      "O pacto do Novo Testamento anula retroativamente a eficácia salvífica do pacto administrado antes de Cristo",
      "Cada dispensação bíblica constitui um pacto próprio e juridicamente independente dos demais"
    ],
    "respostaCorreta": "São o mesmo pacto da graça em substância, variando apenas quanto à forma e ao modo de administração",
    "explicacao": "Seção VI: 'Não há, pois, dois pactos de graça diferentes em substância mas um e o mesmo sob várias dispensações' — posição que se distingue de esquemas dispensacionalistas que multiplicam pactos distintos."
  },
  {
    "id": 14,
    "capitulo": "XXIX - Da Ceia do Senhor",
    "pergunta": "Segundo a Seção VII, como Cristo está presente na Ceia do Senhor, segundo a Confissão — em contraste tanto com a transubstanciação quanto com um memorialismo puramente simbólico?",
    "alternativas": [
      "Espiritual e realmente presente à fé dos crentes, não estando corporal ou carnalmente nos elementos, com eles ou sob eles",
      "Presente corporalmente nos próprios elementos, embora sua substância permaneça oculta sob as aparências de pão e vinho",
      "Presente fisicamente 'com, em e sob' os elementos, unindo-se a eles sem alteração de sua substância",
      "Presente apenas como lembrança mental do sacrifício passado, sem qualquer comunicação espiritual real e presente",
      "Ausente da ordenança, sendo a Ceia apenas um ato comunitário de solidariedade entre os crentes, ainda que essa leitura seja defendida por outras tradições cristãs"
    ],
    "respostaCorreta": "Espiritual e realmente presente à fé dos crentes, não estando corporal ou carnalmente nos elementos, com eles ou sob eles",
    "explicacao": "Seção VII afirma presença real, mas espiritual, recebida pela fé — posição intermediária entre a transubstanciação católica, a consubstanciação luterana ('com, em e sob') e o memorialismo zwingliano."
  },
  {
    "id": 15,
    "capitulo": "XVII - Da Perseverança dos Santos",
    "pergunta": "Segundo a Seção II, sobre o que se funda, em última instância, a certeza da perseverança dos santos — em contraste com uma leitura que a funda no livre-arbítrio humano?",
    "alternativas": [
      "Na disciplina eclesiástica, que impede formalmente a apostasia dos membros batizados, o que não corresponde à formulação exata usada pela Confissão",
      "No compromisso contínuo de boas obras, que sustenta e renova o estado de graça a cada momento, ideia que o texto da Confissão, lido em conjunto, não sustenta",
      "Na intensidade da experiência de conversão inicial, medida subjetivamente pelo próprio crente, contrariando o sentido direto do texto citado nessa seção",
      "Na imutabilidade do decreto de eleição e na eficácia do mérito e da intercessão de Cristo, não no livre-arbítrio dos santos",
      "No livre-arbítrio humano, que, uma vez fortalecido pela graça, garante por si só a perseverança final"
    ],
    "respostaCorreta": "Na imutabilidade do decreto de eleição e na eficácia do mérito e da intercessão de Cristo, não no livre-arbítrio dos santos",
    "explicacao": "Seção II: a perseverança 'não depende do livre arbítrio deles, mas da imutabilidade do decreto da eleição... da eficácia do mérito e intercessão de Jesus Cristo'."
  },
  {
    "id": 16,
    "capitulo": "XXX - Das Censuras Eclesiásticas",
    "pergunta": "Segundo a Seção IV, qual é a ordem progressiva de disciplina que os oficiais da Igreja devem seguir, conforme a natureza do crime e o demérito da pessoa?",
    "alternativas": [
      "Exclusão imediata da Igreja, com possibilidade de repreensão apenas em caso de recurso",
      "Suspensão do batismo dos filhos, seguida de repreensão e, por fim, multa pecuniária",
      "Advertência pública única, sem qualquer gradação posterior de disciplina",
      "Excomunhão imediata, seguida de eventual readmissão após processo civil formal",
      "Repreensão, suspensão do sacramento da Ceia do Senhor e exclusão da Igreja"
    ],
    "respostaCorreta": "Repreensão, suspensão do sacramento da Ceia do Senhor e exclusão da Igreja",
    "explicacao": "Seção IV estabelece uma ordem gradual: repreensão, suspensão da Ceia e, por fim, exclusão — não a excomunhão imediata sem etapas prévias."
  },
  {
    "id": 17,
    "capitulo": "XXVI - Da Comunhão dos Santos",
    "pergunta": "Segundo a Seção III, a comunhão que os santos têm uns com os outros e com Cristo:",
    "alternativas": [
      "Substitui qualquer forma de propriedade individual por um sistema de bens inteiramente comuns, o que não corresponde à formulação exata usada pela Confissão",
      "Implica participação real na substância divina, elevando os santos a uma condição próxima da de Cristo, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo",
      "Não os torna participantes da substância da Divindade nem iguais a Cristo em qualquer respeito, nem elimina o direito de propriedade individual",
      "Exige a abolição de toda propriedade privada entre os membros de uma mesma congregação, ainda que essa leitura seja defendida por outras tradições cristãs",
      "Estende-se apenas aos membros oficialmente ordenados, excluindo os leigos dessa comunhão espiritual, apesar de soar plausível a uma leitura apressada do capítulo"
    ],
    "respostaCorreta": "Não os torna participantes da substância da Divindade nem iguais a Cristo em qualquer respeito, nem elimina o direito de propriedade individual",
    "explicacao": "Seção III nega expressamente tanto a divinização dos santos quanto qualquer forma de comunismo de bens: a comunhão espiritual 'não destrói, nem de modo algum enfraquece o título ou domínio que cada homem tem sobre os seus bens'."
  },
  {
    "id": 18,
    "capitulo": "II - De Deus e da Santíssima Trindade",
    "pergunta": "Segundo a Seção II, qual destas formulações melhor reflete o ensino da Confissão sobre a relação entre Deus e sua glória manifestada nas criaturas?",
    "alternativas": [
      "Deus depende da resposta livre das criaturas para que sua glória se torne plenamente real",
      "Deus criou o mundo por carência interna de comunhão, suprida somente após a criação do homem",
      "A glória de Deus cresce proporcionalmente ao número de criaturas que o adoram ao longo da história",
      "Deus é todo-suficiente em si mesmo e apenas manifesta, sem aumentar, sua glória por meio das criaturas",
      "Deus necessitava das criaturas para completar sua bem-aventurança, embora não dependesse delas para existir"
    ],
    "respostaCorreta": "Deus é todo-suficiente em si mesmo e apenas manifesta, sem aumentar, sua glória por meio das criaturas",
    "explicacao": "Seção II: Deus é 'todo suficiente em si e para si, pois não precisa das criaturas... não deriva delas glória alguma, mas somente manifesta a sua glória nelas'."
  },
  {
    "id": 19,
    "capitulo": "XXIII - Do Magistrado Civil",
    "pergunta": "Segundo a Seção III, qual é o limite da autoridade do magistrado civil em relação à Igreja, segundo a Confissão?",
    "alternativas": [
      "Tem autoridade para determinar o conteúdo doutrinário pregado pelos ministros de cada igreja, apesar de soar plausível a uma leitura apressada do capítulo",
      "Está inteiramente excluído de qualquer relação com a proteção da liberdade religiosa, ideia que o texto da Confissão, lido em conjunto, não sustenta",
      "Deve dar preferência oficial a uma única denominação cristã, subordinando as demais a ela, o que esvaziaria o sentido pastoral atribuído à seção",
      "Não pode administrar a palavra e os sacramentos nem exercer o poder das chaves, mas deve proteger a liberdade dos eclesiásticos no exercício de suas funções",
      "Pode administrar diretamente os sacramentos em situações de vacância pastoral prolongada, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo"
    ],
    "respostaCorreta": "Não pode administrar a palavra e os sacramentos nem exercer o poder das chaves, mas deve proteger a liberdade dos eclesiásticos no exercício de suas funções",
    "explicacao": "Seção III: o magistrado não administra palavra e sacramentos nem o poder das chaves, mas deve proteger a liberdade dos eclesiásticos, 'sem dar preferência a qualquer denominação cristã sobre as outras'."
  },
  {
    "id": 20,
    "capitulo": "XI - Da Justificação",
    "pergunta": "A Seção II, sobre a fé nunca estar sozinha na pessoa justificada, mas ser acompanhada de outras graças e obrar por amor, cita qual destas referências?",
    "alternativas": [
      "Gal. 3:8 (citada na Seção IV, sobre o decreto eterno de justificar os eleitos)",
      "Rom. 3:24, 27-28 (citada na Seção I, sobre o fundamento da justificação)",
      "Rom. 4:25 (citada na Seção IV, sobre a ressurreição de Cristo para a justificação dos eleitos)",
      "Gal. 5:6",
      "Rom. 8:30 (citada na Seção I, sobre o encadeamento entre vocação e justificação)"
    ],
    "respostaCorreta": "Gal. 5:6",
    "explicacao": "A Seção II cita Gal. 5:6 ('a fé que opera por amor'); as demais alternativas pertencem a outras seções do mesmo capítulo."
  },
  {
    "id": 21,
    "capitulo": "XVIII - Da Certeza da Graça e da Salvação",
    "pergunta": "Segundo a Seção I, quem pode iludir-se vãmente com falsas esperanças de estar em estado de graça?",
    "alternativas": [
      "Qualquer crente genuíno, sem exceção, pois a certeza de salvação é declarada inalcançável nesta vida",
      "Apenas os que rejeitam abertamente qualquer prática religiosa exterior",
      "Os hipócritas e os demais não regenerados",
      "Exclusivamente os que abandonam formalmente a comunhão de uma igreja local",
      "Somente os que nunca ouviram a pregação do Evangelho em toda a vida"
    ],
    "respostaCorreta": "Os hipócritas e os demais não regenerados",
    "explicacao": "Seção I distingue a falsa esperança dos hipócritas da certeza legítima acessível aos que verdadeiramente creem e amam a Cristo com sinceridade."
  },
  {
    "id": 22,
    "capitulo": "XXXII - Do Estado do Homem depois da Morte e da Ressurreição dos Mortos",
    "pergunta": "A Seção I, sobre a promessa de Cristo ao ladrão arrependido na cruz como apoio à ideia de que a alma vai imediatamente para Deus, cita qual referência?",
    "alternativas": [
      "Fil. 3:21 (citada na Seção III, sobre a semelhança do corpo ressuscitado ao de Cristo)",
      "At. 13:36 (citada na mesma seção, mas referente à corrupção do corpo de Davi, não à promessa ao ladrão)",
      "At. 24:15 (citada na Seção III, sobre a ressurreição dos justos e injustos)",
      "Luc. 23:43",
      "I Tess. 4:17 (citada na Seção II, sobre os vivos que serão mudados no último dia)"
    ],
    "respostaCorreta": "Luc. 23:43",
    "explicacao": "A Seção I cita Luc. 23:43 especificamente para a promessa 'hoje estarás comigo no paraíso'; as demais alternativas pertencem a outras partes do capítulo."
  },
  {
    "id": 23,
    "capitulo": "VI - Da Queda do Homem, do Pecado e do seu Castigo",
    "pergunta": "Segundo a Seção III, como o pecado de Adão se relaciona com toda a sua posteridade, segundo a Confissão — em contraste com uma visão que nega a imputação do pecado original?",
    "alternativas": [
      "Cada pessoa nasce moralmente neutra, herdando apenas a mortalidade física, sem qualquer imputação de culpa, contrariando o sentido direto do texto citado nessa seção",
      "A corrupção é adquirida somente pela imitação do mau exemplo, não por transmissão da própria natureza, ideia que o texto da Confissão, lido em conjunto, não sustenta",
      "O delito do pecado de Adão foi imputado aos seus descendentes, e a morte em pecado e a natureza corrompida foram transmitidas pela geração ordinária",
      "A posteridade herda a inclinação ao mal, mas não qualquer imputação legal de culpa, o que não corresponde à formulação exata usada pela Confissão",
      "A culpa de Adão afeta apenas os que conscientemente ratificam o pecado dele por atos próprios, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo"
    ],
    "respostaCorreta": "O delito do pecado de Adão foi imputado aos seus descendentes, e a morte em pecado e a natureza corrompida foram transmitidas pela geração ordinária",
    "explicacao": "Seção III afirma tanto a imputação do delito quanto a transmissão real da natureza corrompida — posição que se opõe a leituras pelagianas ou semipelagianas do pecado original."
  },
  {
    "id": 24,
    "capitulo": "XIV - Da Fé Salvadora",
    "pergunta": "A Seção I, sobre a fé ser aumentada e fortalecida pelo ministério da palavra, pelos sacramentos e pela oração, cita qual destas referências?",
    "alternativas": [
      "Rom. 4:19-20 (citada na Seção III, sobre os diferentes graus da fé)",
      "Heb. 11:13 (citada na Seção II, sobre os crentes abraçarem as promessas de longe)",
      "Heb. 6:11, 12 (citada na Seção III, sobre a plena segurança em Cristo)",
      "Rom. 10:14, 17",
      "At. 24:14 (citada na Seção II, sobre crer em tudo o que é revelado na Escritura)"
    ],
    "respostaCorreta": "Rom. 10:14, 17",
    "explicacao": "A Seção I cita Rom. 10:14, 17, sobre a fé vir pelo ouvir a palavra; as demais pertencem a outras seções do mesmo capítulo."
  },
  {
    "id": 25,
    "capitulo": "XI - Da Justificação",
    "pergunta": "Segundo a Seção V, um crente verdadeiramente justificado pode, ao pecar, decair totalmente do estado de justificação?",
    "alternativas": [
      "Sim, sendo restaurado ao estado de justificação somente após novo batismo, contrariando o sentido direto do texto citado nessa seção",
      "Não é abordado nesta seção, que trata apenas da justificação inicial, o que esvaziaria o sentido pastoral atribuído à seção",
      "Não; ainda que possa incorrer no paternal desagrado de Deus e ficar privado da luz do seu rosto até se humilhar e arrepender",
      "Sim, mas apenas se o pecado for considerado mortal segundo a tradição da Igreja, divergindo do que a seção afirma de modo explícito",
      "Sim; cada pecado grave exige uma nova justificação formal, distinta da primeira, posição incompatível com o restante do texto confessional"
    ],
    "respostaCorreta": "Não; ainda que possa incorrer no paternal desagrado de Deus e ficar privado da luz do seu rosto até se humilhar e arrepender",
    "explicacao": "Seção V: o justificado 'nunca poderão decair do estado de justificação', embora possa perder temporariamente a comunhão consciente com Deus por causa do pecado."
  },
  {
    "id": 26,
    "capitulo": "XXXIII - Do Juízo Final",
    "pergunta": "A Seção II, sobre o fim que Deus tem em vista ao determinar o dia do juízo — manifestar a glória da sua misericórdia e da sua justiça —, cita qual destas referências?",
    "alternativas": [
      "Ec. 12:14 (citada na Seção I, sobre a prestação de contas de pensamentos e obras)",
      "Mat. 12:36-37 (citada na Seção I, sobre a conta a ser dada por toda palavra ociosa)",
      "Mat. 25:31-34",
      "II Ped. 2:4 (citada na Seção I, sobre o juízo dos anjos apóstatas)",
      "At. 17:31 (citada na Seção I, sobre Deus ter determinado um dia para julgar o mundo)"
    ],
    "respostaCorreta": "Mat. 25:31-34",
    "explicacao": "A Seção II cita Mat. 25:31-34, entre outras, sobre os justos indo para a vida eterna; as demais alternativas pertencem à Seção I do mesmo capítulo."
  },
  {
    "id": 27,
    "capitulo": "XXXI - Dos Sínodos e Concílios",
    "pergunta": "Segundo a Seção III, qual é a autoridade final atribuída pela Confissão aos sínodos e concílios, mesmo os gerais, desde os tempos apostólicos?",
    "alternativas": [
      "Perdem toda utilidade ou autoridade, não devendo ser convocados desde a conclusão do cânon, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo",
      "Têm autoridade equivalente à da própria Escritura, uma vez formalmente ratificados, divergindo do que a seção afirma de modo explícito",
      "Podem errar, e muitos têm errado, não devendo constituir regra absoluta de fé e prática, mas podendo servir de auxílio",
      "São infalíveis apenas quando decidem por unanimidade absoluta entre todos os presentes, tal como sustentado por correntes teológicas distintas da reformada",
      "São infalíveis sempre que reúnem representantes de todas as igrejas reformadas do mundo, ideia que o texto da Confissão, lido em conjunto, não sustenta"
    ],
    "respostaCorreta": "Podem errar, e muitos têm errado, não devendo constituir regra absoluta de fé e prática, mas podendo servir de auxílio",
    "explicacao": "Seção III: sínodos e concílios 'podem errar, e muitos têm errado', não constituindo regra de fé e prática, mas apenas auxílio subordinado à Escritura."
  },
  {
    "id": 28,
    "capitulo": "Geral - Nota Histórica",
    "pergunta": "Segundo a Nota Histórica, a Confissão de Westminster é descrita como pertencente a qual período de produção confessional, comparável em importância apenas ao período dos credos ecumênicos dos séculos IV e V?",
    "alternativas": [
      "O período medieval escolástico, entre os séculos XII e XIII",
      "O período do Grande Cisma do Oriente, no século XI",
      "O período da Reforma protestante",
      "O período iluminista, entre os séculos XVII e XVIII",
      "O período da patrística pós-nicena, entre os séculos V e VI"
    ],
    "respostaCorreta": "O período da Reforma protestante",
    "explicacao": "Nota Histórica: 'o segundo [período] sincroniza com o período da Reforma', sendo a Confissão de Westminster 'a última das confissões formuladas durante o período da Reforma'."
  },
  {
    "id": 29,
    "capitulo": "III - Dos Eternos Decretos de Deus",
    "pergunta": "Segundo a Seção V, qual é o fundamento da eleição, em contraste com uma leitura arminiana da doutrina?",
    "alternativas": [
      "A eleição funda-se na presciência divina da fé que cada indivíduo exerceria livremente diante do Evangelho",
      "A eleição funda-se em uma combinação entre mérito congruente e graça preveniente, divergindo do que a seção afirma de modo explícito",
      "A eleição funda-se somente na graça e no amor livres de Deus, sem qualquer previsão de fé, obras ou perseverança na criatura",
      "A eleição funda-se na perseverança que Deus previu que o indivíduo manteria até o fim da vida, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo",
      "A eleição funda-se na cooperação prévia entre a graça oferecida e a resposta humana antecipada, o que esvaziaria o sentido pastoral atribuído à seção"
    ],
    "respostaCorreta": "A eleição funda-se somente na graça e no amor livres de Deus, sem qualquer previsão de fé, obras ou perseverança na criatura",
    "explicacao": "Seção V: Deus escolheu os eleitos 'de sua mera e livre graça e amor, e não por previsão de fé, ou de boas obras... como condição ou causa' — rejeitando explicitamente o esquema arminiano da eleição condicional."
  },
  {
    "id": 30,
    "capitulo": "XXVII - Dos Sacramentos",
    "pergunta": "A Seção IV, sobre haver só dois sacramentos ordenados por Cristo no Evangelho, cita qual destas referências?",
    "alternativas": [
      "Gen. 17:10 (citada na Seção II, sobre a relação sacramental entre sinal e coisa significada)",
      "Mat. 28:19",
      "I Cor. 10:1-4 (citada na Seção V, sobre os sacramentos do Velho Testamento)",
      "Rom. 6:11 (citada na Seção I, sobre os sacramentos como sinais do pacto da graça)",
      "I Ped. 3:21 (citada na Seção III, sobre a eficácia dos sacramentos não depender do rito)"
    ],
    "respostaCorreta": "Mat. 28:19",
    "explicacao": "A Seção IV cita Mat. 28:19, I Cor. 11:20, 23-34 e Heb. 5:4; as demais alternativas pertencem a outras seções do capítulo."
  },
  {
    "id": 31,
    "capitulo": "XXIX - Da Ceia do Senhor",
    "pergunta": "Segundo a Seção II, a Confissão rejeita explicitamente qual entendimento da Ceia como um novo sacrifício oferecido pelos vivos e pelos mortos?",
    "alternativas": [
      "A distribuição da Ceia por ministros não episcopalmente ordenados, o que esvaziaria o sentido pastoral atribuído à seção",
      "A recepção do cálice pelos leigos, por comprometer a unicidade do sacrifício original",
      "A prática de partir o pão em assembleia, por implicar repetição indevida do sacrifício de Cristo",
      "A pregação da palavra de instituição antes da Ceia, por antecipar indevidamente o rito",
      "O chamado sacrifício da missa, por ser ofensivo ao único e suficiente sacrifício de Cristo na cruz"
    ],
    "respostaCorreta": "O chamado sacrifício da missa, por ser ofensivo ao único e suficiente sacrifício de Cristo na cruz",
    "explicacao": "Seção II: 'o chamado sacrifício papal da missa é sobremodo ofensivo ao único sacrifício de Cristo' — a Ceia é comemoração, não repetição do sacrifício."
  },
  {
    "id": 32,
    "capitulo": "XXXII - Do Estado do Homem depois da Morte e da Ressurreição dos Mortos",
    "pergunta": "Segundo a Seção II, no último dia, os corpos dos mortos serão ressuscitados:",
    "alternativas": [
      "Com os seus mesmos corpos, ainda que com qualidades diferentes, reunidos às suas almas para sempre",
      "Somente os corpos dos eleitos serão ressuscitados; os dos réprobos permanecerão no pó",
      "Em uma forma corporal única e idêntica para todos, sem distinção entre justos e ímpios",
      "Com corpos totalmente novos e sem qualquer relação de continuidade com os corpos anteriores",
      "Apenas de forma espiritual, sem qualquer dimensão corporal na ressurreição final"
    ],
    "respostaCorreta": "Com os seus mesmos corpos, ainda que com qualidades diferentes, reunidos às suas almas para sempre",
    "explicacao": "Seção II: os mortos 'serão ressuscitados com os seus mesmos corpos e não outros, posto que com qualidades diferentes'."
  },
  {
    "id": 33,
    "capitulo": "VIII - De Cristo o Mediador",
    "pergunta": "Segundo a Seção VIII, como a salvação adquirida por Cristo é aplicada aos eleitos, em contraste com uma leitura que a torna meramente possível a todos indistintamente?",
    "alternativas": [
      "Cristo torna a salvação igualmente possível a todos os homens, cabendo à vontade humana decidir sua aplicação final, ainda que essa leitura seja defendida por outras tradições cristãs",
      "Cristo aplica a salvação por meio exclusivo dos sacramentos, independentemente da fé pessoal, divergindo do que a seção afirma de modo explícito",
      "Cristo aplica a salvação de modo condicional, aguardando a cooperação humana em cada etapa do processo, posição incompatível com o restante do texto confessional",
      "Cristo aplica e comunica com toda a certeza e eficácia a salvação a todos aqueles para os quais a adquiriu, persuadindo-os eficazmente pelo seu Espírito",
      "Cristo oferece a salvação de modo genérico, sem qualquer eficácia particular garantida aos eleitos, apesar de soar plausível a uma leitura apressada do capítulo"
    ],
    "respostaCorreta": "Cristo aplica e comunica com toda a certeza e eficácia a salvação a todos aqueles para os quais a adquiriu, persuadindo-os eficazmente pelo seu Espírito",
    "explicacao": "Seção VIII afirma a aplicação certa e eficaz da redenção adquirida — expressão do princípio reformado da redenção particular e eficaz."
  },
  {
    "id": 34,
    "capitulo": "III - Dos Eternos Decretos de Deus",
    "pergunta": "Segundo a Seção I, ao decretar livremente tudo quanto acontece, Deus:",
    "alternativas": [
      "Torna-se causa moral direta do pecado, ainda que sem culpa, por decretar sua ocorrência, divergindo do que a seção afirma de modo explícito",
      "Não é o autor do pecado, nem é violentada a vontade da criatura, nem eliminada a contingência das causas secundárias",
      "Decreta apenas o bem, deixando o mal inteiramente fora do âmbito do seu eterno conselho, tal como sustentado por correntes teológicas distintas da reformada",
      "Suspende temporariamente sua soberania sobre eventos contingentes, delegando-a às causas secundárias",
      "Elimina toda contingência genuína, tornando as causas secundárias meras aparências sem eficácia real"
    ],
    "respostaCorreta": "Não é o autor do pecado, nem é violentada a vontade da criatura, nem eliminada a contingência das causas secundárias",
    "explicacao": "Seção I preserva simultaneamente a soberania absoluta do decreto e a integridade da vontade da criatura e das causas secundárias."
  },
  {
    "id": 35,
    "capitulo": "XXVII - Dos Sacramentos",
    "pergunta": "Segundo a Seção III, a eficácia da graça significada nos sacramentos depende de quê — em contraste com uma leitura ex opere operato que a vincula ao ato ritual em si?",
    "alternativas": [
      "Da autoridade formal e da validade canônica da ordenação do ministro que os administra, divergindo do que a seção afirma de modo explícito",
      "Da obra do Espírito e da palavra da instituição, e não de qualquer poder inerente aos próprios sacramentos ou da piedade de quem os administra",
      "Do poder espiritual contido nos próprios elementos materiais, uma vez devidamente consagrados, posição incompatível com o restante do texto confessional",
      "Exclusivamente da piedade pessoal e da intenção reta do ministro que os administra, apesar de soar plausível a uma leitura apressada do capítulo",
      "Da frequência com que a pessoa participa deles ao longo da vida cristã, o que não corresponde à formulação exata usada pela Confissão"
    ],
    "respostaCorreta": "Da obra do Espírito e da palavra da instituição, e não de qualquer poder inerente aos próprios sacramentos ou da piedade de quem os administra",
    "explicacao": "Seção III rejeita a eficácia automática (ex opere operato): a graça depende 'da obra do Espírito e da palavra da instituição', não de poder inerente ao rito ou da piedade do ministro."
  },
  {
    "id": 36,
    "capitulo": "XXVIII - Do Batismo",
    "pergunta": "A Seção I, sobre o batismo como sinal e selo do pacto da graça e da regeneração, cita qual destas referências?",
    "alternativas": [
      "At. 2:41 e 10:46-47 (citada na Seção III, sobre o modo de administração do batismo)",
      "Rom. 6:3-4",
      "At. 10:47 e 8:36-38 (citada na Seção II, sobre a água como elemento do batismo)",
      "Luc. 7:30 (citada na Seção V, sobre o pecado de desprezar a ordenança do batismo)",
      "Gal. 3:9, 14 (citada na Seção IV, sobre os filhos de pais crentes serem batizados)"
    ],
    "respostaCorreta": "Rom. 6:3-4",
    "explicacao": "A Seção I cita, entre outras, Rom. 6:3-4, sobre o batismo significar a união com Cristo em novidade de vida; as demais pertencem a outras seções do capítulo."
  },
  {
    "id": 37,
    "capitulo": "XIV - Da Fé Salvadora",
    "pergunta": "Segundo a Seção I, por qual meio a graça da fé é ordinariamente operada e, em seguida, aumentada e fortalecida?",
    "alternativas": [
      "Pelo ministério da palavra, sendo aumentada também pela administração dos sacramentos e pela oração",
      "Por experiências místicas diretas, independentes da pregação ou dos sacramentos",
      "Por revelações extraordinárias concedidas individualmente a cada crente, ainda que essa leitura seja defendida por outras tradições cristãs",
      "Exclusivamente pela participação regular na Ceia do Senhor, sem relação necessária com a pregação",
      "Por herança familiar, sendo transmitida de pais para filhos independentemente do ministério da palavra"
    ],
    "respostaCorreta": "Pelo ministério da palavra, sendo aumentada também pela administração dos sacramentos e pela oração",
    "explicacao": "Seção I: a fé 'é ordinariamente operada pelo ministério da palavra; por esse ministério, bem como pela administração dos sacramentos e pela oração, ela é aumentada e fortalecida'."
  },
  {
    "id": 38,
    "capitulo": "X - Da Vocação Eficaz",
    "pergunta": "Segundo a Seção II, na vocação eficaz, o papel do homem antes de ser vivificado pelo Espírito é descrito como:",
    "alternativas": [
      "Parcialmente ativo, contribuindo com um mérito congruente que dispõe Deus a agir, ideia que o texto da Confissão, lido em conjunto, não sustenta",
      "Ativo desde o início, pois a vontade humana coopera com a graça antes mesmo da regeneração",
      "Determinante, já que a vocação eficaz depende do consentimento prévio da vontade humana",
      "Irrelevante, pois a vocação eficaz ocorre sem qualquer relação com a vontade humana, mesmo depois de vivificado",
      "Inteiramente passivo, até ser vivificado e renovado, quando então se habilita a responder à graça oferecida"
    ],
    "respostaCorreta": "Inteiramente passivo, até ser vivificado e renovado, quando então se habilita a responder à graça oferecida",
    "explicacao": "Seção II: o homem é 'inteiramente passivo, até que, vivificado e renovado pelo Espírito Santo, fica habilitado a corresponder a ela'."
  },
  {
    "id": 39,
    "capitulo": "VIII - De Cristo o Mediador",
    "pergunta": "Segundo a Seção V, a obediência e o sacrifício de Cristo satisfizeram plenamente a justiça do Pai. Qual formulação abaixo é incompatível com essa seção?",
    "alternativas": [
      "A satisfação de Cristo foi parcial, sendo completada pelos méritos e penitências dos próprios crentes",
      "A satisfação foi oferecida uma só vez, pelo Eterno Espírito, sem necessidade de repetição",
      "A satisfação de Cristo foi plena e única, adquirindo reconciliação e herança perdurável para os eleitos",
      "A obediência de Cristo incluiu tanto a obediência ativa quanto a passiva, culminando no sacrifício de si mesmo",
      "A satisfação de Cristo alcançou plenamente aqueles que o Pai lhe deu, segundo o pacto eterno"
    ],
    "respostaCorreta": "A satisfação de Cristo foi parcial, sendo completada pelos méritos e penitências dos próprios crentes",
    "explicacao": "A Seção V afirma satisfação plena e única por Cristo; a ideia de complemento por méritos humanos é estranha ao texto e contraria a doutrina da satisfação vicária completa."
  },
  {
    "id": 40,
    "capitulo": "I - Da Escritura Sagrada",
    "pergunta": "Segundo a Seção IX, quando há dúvida sobre o sentido pleno de um texto bíblico, a Confissão prescreve que:",
    "alternativas": [
      "O texto obscuro deve ceder à tradição patrística sempre que esta apresentar leitura mais antiga",
      "O texto obscuro deve ser interpretado livremente por cada crente, sem recurso a outros textos bíblicos",
      "O texto obscuro deve ser interpretado por outros textos que falem mais claramente sobre o mesmo assunto",
      "O texto obscuro deve ser resolvido pela autoridade final do magistério eclesiástico reunido em concílio",
      "O texto obscuro permanece propositalmente indecidível, cabendo à razão natural suprir o sentido"
    ],
    "respostaCorreta": "O texto obscuro deve ser interpretado por outros textos que falem mais claramente sobre o mesmo assunto",
    "explicacao": "Seção IX: a Escritura interpreta a si mesma; textos obscuros são esclarecidos por textos mais claros sobre o mesmo assunto (analogia da fé)."
  },
  {
    "id": 41,
    "capitulo": "XXXIV - Do Espírito Santo",
    "pergunta": "Segundo a Seção II, por meio de quem os autores da Sagrada Escritura foram levados a registrar infalivelmente a vontade de Deus?",
    "alternativas": [
      "Pela tradição oral da comunidade, posteriormente sistematizada pelos concílios",
      "Pelo próprio raciocínio humano, iluminado apenas indiretamente pela providência geral",
      "Pelos anjos, que ditaram diretamente o texto aos escritores humanos",
      "Pelo Espírito Santo",
      "Por Cristo pessoalmente, em aparições privadas a cada um dos autores bíblicos"
    ],
    "respostaCorreta": "Pelo Espírito Santo",
    "explicacao": "Seção II: 'Por Ele os Profetas foram levados a falar a Palavra de Deus, e todos os autores da Sagrada Escritura foram inspirados a registrar de um modo infalível a disposição e a vontade de Deus'."
  },
  {
    "id": 42,
    "capitulo": "I - Da Escritura Sagrada",
    "pergunta": "A Seção V afirma que a certeza plena da autoridade divina da Escritura provém, em última instância, da operação interna do Espírito Santo, e não apenas do testemunho da Igreja. Qual referência é citada como apoio direto a essa seção?",
    "alternativas": [
      "Gênesis 1:1",
      "Salmos 23:1",
      "I João 2:20, 27",
      "Apocalipse 21:1",
      "Mateus 6:9-13"
    ],
    "respostaCorreta": "I João 2:20, 27",
    "explicacao": "Seção V cita I Tim. 3:15; I João 2:20, 27; João 16:13-14; I Cor. 2:10-12, referentes ao testemunho interno do Espírito."
  },
  {
    "id": 43,
    "capitulo": "I - Da Escritura Sagrada",
    "pergunta": "Segundo a Seção VI, como a Confissão trata a possibilidade de novas revelações do Espírito complementarem a Escritura?",
    "alternativas": [
      "Aceita a tradição apostólica não escrita como fonte de igual autoridade, complementar à Escritura",
      "Reserva a possibilidade de revelação contínua exclusivamente aos apóstolos e seus sucessores diretos",
      "Admite novas revelações do Espírito, desde que confirmadas posteriormente por um concílio ecumênico",
      "Permite acréscimos doutrinários sempre que confirmados pela experiência religiosa da comunidade",
      "Nega expressamente que algo se acrescente à Escritura, seja por novas revelações do Espírito, seja por tradições humanas"
    ],
    "respostaCorreta": "Nega expressamente que algo se acrescente à Escritura, seja por novas revelações do Espírito, seja por tradições humanas",
    "explicacao": "Seção VI: 'À Escritura nada se acrescentará em tempo algum, nem por novas revelações do Espírito, nem por tradições dos homens'."
  },
  {
    "id": 44,
    "capitulo": "XIX - Da Lei de Deus",
    "pergunta": "Segundo a Seção II, os dez mandamentos, escritos em duas tábuas no monte Sinai, dividem-se, segundo a Confissão, em:",
    "alternativas": [
      "Três mandamentos para com Deus e sete para com o próximo, seguindo a divisão hebraica clássica",
      "Todos os dez voltados igualmente e sem distinção para os deveres para com o próximo",
      "Cinco mandamentos para cada tábua, distribuídos de modo simétrico entre Deus e o próximo",
      "Quatro mandamentos que ensinam os deveres para com Deus e seis que ensinam os deveres para com o homem",
      "Seis mandamentos para com Deus e quatro para com o homem, invertendo a divisão usual"
    ],
    "respostaCorreta": "Quatro mandamentos que ensinam os deveres para com Deus e seis que ensinam os deveres para com o homem",
    "explicacao": "Seção II: 'os primeiros quatro mandamentos ensinam os nossos deveres para com Deus e os outros seis os nossos deveres para com o homem'."
  },
  {
    "id": 45,
    "capitulo": "XVII - Da Perseverança dos Santos",
    "pergunta": "Segundo a Seção III, os verdadeiros santos, mesmo perseverando ao final, podem:",
    "alternativas": [
      "Permanecer sempre imunes a qualquer queda moral, em virtude da segurança da eleição",
      "Cair em graves pecados por algum tempo, incorrendo no desagrado de Deus e trazendo juízos temporais sobre si",
      "Perder totalmente a salvação, sendo readmitidos apenas por um novo ato de justificação",
      "Ser definitivamente excluídos da comunhão da Igreja, ainda que permaneçam salvos diante de Deus",
      "Cometer pecados graves sem qualquer consequência disciplinar, dada a certeza da perseverança"
    ],
    "respostaCorreta": "Cair em graves pecados por algum tempo, incorrendo no desagrado de Deus e trazendo juízos temporais sobre si",
    "explicacao": "Seção III: os santos podem 'cair em graves pecados e por algum tempo continuar neles', incorrendo em desagrado divino e juízos temporais, sem que isso signifique perda final da salvação."
  },
  {
    "id": 46,
    "capitulo": "Geral - Estrutura da Confissão",
    "pergunta": "Segundo o texto final anexo ('Autoridade da Confissão de Fé e dos Catecismos'), qual é a relação de autoridade que a Igreja Presbiteriana estabelece entre a Escritura e a própria Confissão de Fé?",
    "alternativas": [
      "A Escritura é a suprema e infalível regra de fé e prática; a Confissão deriva toda a sua autoridade dela e a ela se subordina inteiramente",
      "A Confissão substitui, para fins práticos, a necessidade de recurso direto e constante à Escritura, posição incompatível com o restante do texto confessional",
      "A Escritura e a Confissão possuem autoridade igual e complementar, formando juntas a regra de fé, contrariando o sentido direto do texto citado nessa seção",
      "A autoridade da Confissão independe de sua conformidade com a Escritura, bastando o consenso eclesiástico, o que esvaziaria o sentido pastoral atribuído à seção",
      "A Escritura só pode ser corretamente lida à luz da Confissão, que funciona como norma superior a ela, ainda que essa leitura seja defendida por outras tradições cristãs"
    ],
    "respostaCorreta": "A Escritura é a suprema e infalível regra de fé e prática; a Confissão deriva toda a sua autoridade dela e a ela se subordina inteiramente",
    "explicacao": "O texto final afirma que a Escritura é 'a suprema e infalível regra de fé e prática', e que a Confissão 'dela deriva toda a sua autoridade e a ela tudo se subordina' — não uma autoridade paralela ou superior."
  },
  {
    "id": 47,
    "capitulo": "XXVIII - Do Batismo",
    "pergunta": "Segundo a Seção III, sobre o modo de administração do batismo, a Confissão ensina que:",
    "alternativas": [
      "O modo de administração é indiferente doutrinariamente, mas a Confissão exige sempre água corrente",
      "A forma de administração deve variar conforme a idade do batizando, exigindo imersão para adultos",
      "Não é necessário imergir o candidato na água, sendo o batismo devidamente administrado por efusão ou aspersão",
      "A efusão é a única forma válida, sendo a aspersão e a imersão consideradas inválidas",
      "A imersão total é a única forma válida de batismo reconhecida pela Confissão, ideia que o texto da Confissão, lido em conjunto, não sustenta"
    ],
    "respostaCorreta": "Não é necessário imergir o candidato na água, sendo o batismo devidamente administrado por efusão ou aspersão",
    "explicacao": "Seção III rejeita a exigência de imersão, afirmando expressamente a validade da efusão ou aspersão — posição que difere de tradições que exigem imersão total."
  },
  {
    "id": 48,
    "capitulo": "XXXV - Do Amor de Deus e das Missões",
    "pergunta": "Segundo a Seção IV, visto não haver outro caminho de salvação senão o revelado no Evangelho, qual é a obrigação atribuída a todos os crentes, e não apenas aos ministros ordenados?",
    "alternativas": [
      "Aguardar passivamente a ação do Espírito, sem qualquer responsabilidade prática atribuída ao leigo, contrariando o sentido direto do texto citado nessa seção",
      "Sustentar as ordenanças religiosas já estabelecidas e contribuir, por orações, ofertas e esforços, para a dilatação do Reino de Cristo",
      "Administrar os sacramentos sempre que um ministro ordenado estiver ausente da comunidade, ainda que essa leitura seja defendida por outras tradições cristãs",
      "Financiar exclusivamente, sem qualquer outra forma de participação pessoal na obra missionária, o que não corresponde à formulação exata usada pela Confissão",
      "Pregar formalmente em público, função que a Confissão estende a todo crente batizado, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo"
    ],
    "respostaCorreta": "Sustentar as ordenanças religiosas já estabelecidas e contribuir, por orações, ofertas e esforços, para a dilatação do Reino de Cristo",
    "explicacao": "Seção IV: 'Todos os crentes, portanto, têm por obrigação sustentar as ordenanças religiosas... e contribuir, por meio de suas orações e ofertas e por seus esforços, para a dilatação do Reino de Cristo'."
  },
  {
    "id": 49,
    "capitulo": "XXI - Do Culto Religioso e do Domingo",
    "pergunta": "A Seção VI afirma que, sob o Evangelho, o culto religioso não está restrito a um lugar específico, devendo Deus ser adorado 'em espírito e verdade'. Qual referência é citada como apoio a essa parte específica da seção?",
    "alternativas": [
      "Levítico 1:1-3",
      "Números 28:1-2",
      "Deuteronômio 12:5-7",
      "Êxodo 20:4-6",
      "João 4:23-24"
    ],
    "respostaCorreta": "João 4:23-24",
    "explicacao": "A Seção VI cita, entre outras, a ideia de adoração 'em espírito e verdade', associada a João 4:23-24, sobre a universalidade do lugar de culto sob o Evangelho."
  },
  {
    "id": 50,
    "capitulo": "XXX - Das Censuras Eclesiásticas",
    "pergunta": "Segundo a Seção III, qual NÃO é apresentada pela Confissão como finalidade das censuras eclesiásticas?",
    "alternativas": [
      "Arrecadar recursos financeiros para a manutenção das estruturas eclesiásticas locais",
      "Evitar a ira de Deus, que poderia cair sobre a Igreja por tolerar ofensores notórios",
      "Impedir que outros pratiquem ofensas semelhantes às cometidas",
      "Vindicar a honra de Cristo e a santa profissão do Evangelho",
      "Chamar e ganhar para Cristo os irmãos ofensores"
    ],
    "respostaCorreta": "Arrecadar recursos financeiros para a manutenção das estruturas eclesiásticas locais",
    "explicacao": "Seção III lista como finalidades: ganhar o ofensor, prevenir ofensas semelhantes, purgar o fermento, vindicar a honra de Cristo e evitar a ira divina — nenhuma menção a finalidade financeira."
  },
  {
    "id": 51,
    "capitulo": "VIII - De Cristo o Mediador",
    "pergunta": "Segundo a Seção II, como a Confissão descreve a união entre a natureza divina e a natureza humana em Cristo — em contraste com o eutiquianismo, que ensinava a fusão das naturezas em uma só?",
    "alternativas": [
      "As duas naturezas permaneceram unidas apenas moralmente, sem união real na pessoa de Cristo, divergindo do que a seção afirma de modo explícito",
      "A natureza divina se retirou temporariamente durante a paixão, deixando Cristo apenas humano na cruz, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo",
      "As duas naturezas, inteiras e distintas, foram inseparavelmente unidas em uma só pessoa, sem conversão, composição ou confusão",
      "A natureza humana foi absorvida pela divina no momento da ressurreição, deixando de ser plenamente humana",
      "As duas naturezas se fundiram em uma terceira natureza mista, nem plenamente divina nem plenamente humana"
    ],
    "respostaCorreta": "As duas naturezas, inteiras e distintas, foram inseparavelmente unidas em uma só pessoa, sem conversão, composição ou confusão",
    "explicacao": "Seção II segue a definição de Calcedônia: união hipostática sem 'conversão, composição ou confusão' — rejeitando tanto o eutiquianismo (fusão) quanto o nestorianismo (separação)."
  },
  {
    "id": 52,
    "capitulo": "XI - Da Justificação",
    "pergunta": "Segundo a Seção I, o que exatamente é imputado ao crente na justificação — em contraste com uma leitura que toma a própria fé como a justiça imputada?",
    "alternativas": [
      "O arrependimento sincero do crente, tomado como equivalente à obediência que a lei exige",
      "Uma combinação entre a fé exercida e as obras realizadas em estado de graça, tal como sustentado por correntes teológicas distintas da reformada",
      "A fé do próprio crente, considerada por Deus como um ato de justiça suficiente diante da lei",
      "A obediência e a satisfação de Cristo, e não a fé, o ato de crer ou qualquer outro ato de obediência evangélica",
      "Uma justiça infundida gradualmente, que cresce à medida que o crente pratica boas obras"
    ],
    "respostaCorreta": "A obediência e a satisfação de Cristo, e não a fé, o ato de crer ou qualquer outro ato de obediência evangélica",
    "explicacao": "Seção I: Deus não imputa 'a própria fé, o ato de crer ou qualquer outro ato de obediência evangélica, mas... a obediência e a satisfação de Cristo'."
  },
  {
    "id": 53,
    "capitulo": "V - Da Providência",
    "pergunta": "Segundo a Seção III, sobre o uso de meios na providência ordinária, a Confissão ensina que Deus:",
    "alternativas": [
      "Ordinariamente emprega meios, mas é livre para operar sem eles, sobre eles ou contra eles, segundo o seu arbítrio",
      "Está sempre limitado a agir por meio de causas naturais já estabelecidas na criação, o que esvaziaria o sentido pastoral atribuído à seção",
      "Age exclusivamente por meios extraordinários, reservando os ordinários apenas à era apostólica",
      "Nunca intervém além dos meios ordinários, para não violar a ordem natural que instituiu, tal como sustentado por correntes teológicas distintas da reformada",
      "Abandonou totalmente o uso de meios após a ascensão de Cristo ao céu, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo"
    ],
    "respostaCorreta": "Ordinariamente emprega meios, mas é livre para operar sem eles, sobre eles ou contra eles, segundo o seu arbítrio",
    "explicacao": "Seção III: Deus normalmente emprega meios, mas permanece soberanamente livre para agir sem eles, sobre eles ou contra eles."
  },
  {
    "id": 54,
    "capitulo": "IX - Do Livre Arbítrio",
    "pergunta": "Segundo a Seção III, o homem caído em estado de pecado, quanto ao bem espiritual que acompanha a salvação, está:",
    "alternativas": [
      "Totalmente incapaz, por seu próprio poder, de converter-se ou mesmo de preparar-se para a conversão",
      "Parcialmente capaz, retendo um resquício de poder espiritual suficiente para iniciar sua própria conversão",
      "Plenamente capaz de fazer o bem espiritual, embora normalmente escolha não fazê-lo",
      "Incapaz apenas de completar a salvação, mas capaz de dar o primeiro passo em direção a ela",
      "Capaz de preparar-se moralmente, ainda que a conversão final dependa só de Deus"
    ],
    "respostaCorreta": "Totalmente incapaz, por seu próprio poder, de converter-se ou mesmo de preparar-se para a conversão",
    "explicacao": "Seção III nega qualquer capacidade humana autônoma, mesmo preparatória, para o bem espiritual que acompanha a salvação — posição contrária ao semipelagianismo."
  },
  {
    "id": 55,
    "capitulo": "XIX - Da Lei de Deus",
    "pergunta": "A Seção II, sobre os dez mandamentos escritos em duas tábuas no monte Sinai, cita qual destas referências?",
    "alternativas": [
      "Rom. 7:12, 22, 25 (citada na Seção VI, sobre a lei como regra de vida do crente)",
      "Deut. 10:4",
      "Gal. 3:24 (citada na Seção VI, sobre a lei conduzindo o crente a Cristo)",
      "Esdras 9:13-14 (citada na Seção VI, sobre as aflições merecidas pelo pecado)",
      "Rom. 3:31 (citada na Seção V, sobre a lei obrigar para sempre a todos)"
    ],
    "respostaCorreta": "Deut. 10:4",
    "explicacao": "A Seção II cita Tiago 1:25 e 2:8, 10; Deut. 5:32 e 10:4; Mat. 22:37-40; as demais opções pertencem a outras seções do capítulo."
  },
  {
    "id": 56,
    "capitulo": "XXV - Da Igreja",
    "pergunta": "Segundo a Seção V, sobre a possibilidade de erro nas igrejas particulares, a Confissão ensina que:",
    "alternativas": [
      "A pureza de uma igreja depende exclusivamente da validade formal da sucessão apostólica de seus ministros, apesar de soar plausível a uma leitura apressada do capítulo",
      "Nenhuma igreja verdadeiramente fundada sobre a Escritura pode jamais degenerar ou cair em erro grave, o que esvaziaria o sentido pastoral atribuído à seção",
      "O erro é possível apenas em questões secundárias, nunca podendo comprometer a identidade da igreja, tal como sustentado por correntes teológicas distintas da reformada",
      "Até as igrejas mais puras estão sujeitas à mistura e ao erro, podendo algumas degenerar a ponto de deixarem de ser igrejas de Cristo",
      "Somente as igrejas que rejeitam formalmente a Confissão estão sujeitas a erro doutrinário sério, contrariando o sentido direto do texto citado nessa seção"
    ],
    "respostaCorreta": "Até as igrejas mais puras estão sujeitas à mistura e ao erro, podendo algumas degenerar a ponto de deixarem de ser igrejas de Cristo",
    "explicacao": "Seção V: mesmo 'as igrejas mais puras debaixo do céu estão sujeitas à mistura e ao erro; algumas têm degenerado ao ponto de não serem mais igrejas de Cristo'."
  },
  {
    "id": 57,
    "capitulo": "I - Da Escritura Sagrada",
    "pergunta": "Segundo a Seção I, qual é a relação exata entre a luz da natureza e a salvação?",
    "alternativas": [
      "A luz da natureza equivale em autoridade à Escritura, servindo como segunda fonte independente de doutrina",
      "A luz da natureza revela genuinamente atributos de Deus e torna os homens inescusáveis, mas não basta para o conhecimento salvador",
      "A luz da natureza foi válida apenas antes do dilúvio, perdendo toda função revelatória depois dele, tal como sustentado por correntes teológicas distintas da reformada",
      "A luz da natureza não comunica nenhum conhecimento verdadeiro de Deus, sendo inteiramente anulada pela queda",
      "A luz da natureza é plenamente suficiente para a salvação, dispensando qualquer revelação especial escrita"
    ],
    "respostaCorreta": "A luz da natureza revela genuinamente atributos de Deus e torna os homens inescusáveis, mas não basta para o conhecimento salvador",
    "explicacao": "Seção I: a luz da natureza manifesta a bondade, sabedoria e poder de Deus e torna os homens inescusáveis, mas não é suficiente para dar o conhecimento necessário à salvação."
  },
  {
    "id": 58,
    "capitulo": "VIII - De Cristo o Mediador",
    "pergunta": "A Seção IV, sobre a obediência de Cristo à lei, sua morte, sepultamento e ressurreição ao terceiro dia, cita qual destas referências, também citada na mesma seção?",
    "alternativas": [
      "Isa. 42:1 (citada na Seção I, sobre a eleição de Cristo como Mediador)",
      "Heb. 7:26 (citada na Seção III, sobre a santificação da natureza humana de Cristo)",
      "João 17:2 (citada na Seção V, sobre a satisfação plena à justiça do Pai)",
      "Rom. 8:34 (citada na Seção IV, mas referente à intercessão, não à ressurreição ao terceiro dia)",
      "I Cor. 15:4"
    ],
    "respostaCorreta": "I Cor. 15:4",
    "explicacao": "A Seção IV cita I Cor. 15:4 especificamente sobre a ressurreição 'ao terceiro dia'; as demais pertencem a outras partes do capítulo ou a outro aspecto da mesma seção."
  },
  {
    "id": 59,
    "capitulo": "XXIV - Do Matrimônio e do Divórcio",
    "pergunta": "Segundo a Seção VI, para a dissolução legítima do matrimônio, a Confissão exige:",
    "alternativas": [
      "A aprovação exclusiva do magistrado civil, sem qualquer participação da Igreja no processo",
      "A aprovação exclusiva da Igreja local, sem qualquer participação do magistrado civil, apesar de soar plausível a uma leitura apressada do capítulo",
      "Um processo público e regular, não podendo o caso ser decidido pelo mero arbítrio e discrição das próprias partes",
      "Um período mínimo de separação informal, após o qual o divórcio se torna automático, o que esvaziaria o sentido pastoral atribuído à seção",
      "Apenas o consentimento mútuo das partes, formalizado por escrito perante testemunhas, o que não corresponde à formulação exata usada pela Confissão"
    ],
    "respostaCorreta": "Um processo público e regular, não podendo o caso ser decidido pelo mero arbítrio e discrição das próprias partes",
    "explicacao": "Seção VI exige processo público e regular, vedando que as próprias partes decidam autonomamente o caso."
  },
  {
    "id": 60,
    "capitulo": "XXXIV - Do Espírito Santo",
    "pergunta": "Segundo a Seção III, qual é o papel do Espírito Santo na aplicação da redenção, em contraste com uma leitura sinergista que divide igualmente essa aplicação entre Deus e o homem?",
    "alternativas": [
      "Limita-se a confirmar externamente, pelos sacramentos, uma fé já gerada por esforço próprio do crente",
      "É o único agente eficaz na aplicação da redenção, convencendo, regenerando e habilitando os homens a abraçar a Cristo pela fé",
      "Atua apenas de modo auxiliar, fortalecendo uma decisão que a vontade humana já tomou por si mesma, contrariando o sentido direto do texto citado nessa seção",
      "É um entre vários agentes igualmente responsáveis, cooperando com a vontade humana em condições de igualdade",
      "Age somente sobre os ministros ordenados, transmitindo por eles a eficácia da redenção aos demais, o que não corresponde à formulação exata usada pela Confissão"
    ],
    "respostaCorreta": "É o único agente eficaz na aplicação da redenção, convencendo, regenerando e habilitando os homens a abraçar a Cristo pela fé",
    "explicacao": "Seção III: o Espírito Santo 'é o único agente eficaz na aplicação da redenção' — posição monergista quanto à aplicação da salvação."
  },
  {
    "id": 61,
    "capitulo": "XXXIII - Do Juízo Final",
    "pergunta": "Segundo a Seção III, por que Deus quer que o dia do juízo permaneça desconhecido dos homens, apesar de quererem que estejam convictos de que ele ocorrerá?",
    "alternativas": [
      "Para que os homens se despojem de toda confiança carnal, sejam sempre vigilantes e estejam prontos, não sabendo a hora",
      "Para poder julgar em segredo os que tentarem calcular ou prever a data exata do evento, apesar de soar plausível a uma leitura apressada do capítulo",
      "Porque o juízo final já ocorreu de modo espiritual e invisível na história da Igreja, posição incompatível com o restante do texto confessional",
      "Para que apenas os eleitos, por revelação especial, possam antecipar corretamente a data, contrariando o sentido direto do texto citado nessa seção",
      "Porque o próprio Deus ainda não determinou definitivamente quando esse dia ocorrerá, ainda que essa leitura seja defendida por outras tradições cristãs"
    ],
    "respostaCorreta": "Para que os homens se despojem de toda confiança carnal, sejam sempre vigilantes e estejam prontos, não sabendo a hora",
    "explicacao": "Seção III: o desconhecimento da data serve para que os homens 'se despojem de toda confiança carnal, sejam sempre vigilantes... e estejam prontos'."
  },
  {
    "id": 62,
    "capitulo": "XVI - Das Boas Obras",
    "pergunta": "Segundo a Seção III, o poder de praticar boas obras no crente regenerado provém:",
    "alternativas": [
      "Inteiramente do Espírito de Cristo, exigindo uma influência positiva contínua do Espírito além da graça já recebida",
      "Da própria vontade humana renovada, que passa a agir de modo autônomo em relação à graça, posição incompatível com o restante do texto confessional",
      "Da disciplina eclesiástica, que capacita moralmente o crente por meio dos sacramentos, o que não corresponde à formulação exata usada pela Confissão",
      "De um esforço moral independente, complementado apenas ocasionalmente pela graça divina, apesar de soar plausível a uma leitura apressada do capítulo",
      "De um mérito acumulado progressivamente, que dispensa nova assistência divina após certo ponto"
    ],
    "respostaCorreta": "Inteiramente do Espírito de Cristo, exigindo uma influência positiva contínua do Espírito além da graça já recebida",
    "explicacao": "Seção III: o poder de fazer boas obras 'não é de modo algum dos próprios fiéis, mas provém inteiramente do Espírito de Cristo', exigindo influência contínua além da graça já recebida."
  },
  {
    "id": 63,
    "capitulo": "XXIII - Do Magistrado Civil",
    "pergunta": "Segundo a Seção IV, a incredulidade ou a indiferença religiosa de um magistrado civil:",
    "alternativas": [
      "Dispensa exclusivamente os eclesiásticos da obediência, embora o restante do povo permaneça obrigado",
      "Anula automaticamente sua autoridade legítima, dispensando o povo de qualquer obediência civil",
      "Torna sua autoridade válida apenas em assuntos estritamente civis, nunca em qualquer outro âmbito",
      "Obriga o povo a resistir ativamente até que um magistrado professamente cristão assuma o cargo",
      "Não anula sua justa e legal autoridade, nem dispensa o povo, incluindo os eclesiásticos, da obediência devida"
    ],
    "respostaCorreta": "Não anula sua justa e legal autoridade, nem dispensa o povo, incluindo os eclesiásticos, da obediência devida",
    "explicacao": "Seção IV: 'Incredulidade ou indiferença de religião não anula a justa e legal autoridade do magistrado, nem absolve o povo da obediência que lhe deve'."
  },
  {
    "id": 64,
    "capitulo": "XV - Do Arrependimento para a Vida",
    "pergunta": "Segundo a Seção III, qual é a relação exata entre o arrependimento e o perdão dos pecados — em contraste com uma leitura que trata o arrependimento como satisfação penitencial?",
    "alternativas": [
      "O arrependimento é dispensável, bastando a fé inicial professada no momento da conversão, posição incompatível com o restante do texto confessional",
      "O arrependimento é necessário para que o pecador espere o perdão, mas não é ele mesmo uma satisfação pelo pecado, nem a causa do perdão",
      "O arrependimento é a causa direta e suficiente do perdão, independente da obra de Cristo, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo",
      "O arrependimento deve ser mediado por um sacerdote para ter qualquer eficácia diante de Deus, tal como sustentado por correntes teológicas distintas da reformada",
      "O arrependimento constitui uma satisfação parcial pelo pecado, complementando a obra de Cristo, contrariando o sentido direto do texto citado nessa seção"
    ],
    "respostaCorreta": "O arrependimento é necessário para que o pecador espere o perdão, mas não é ele mesmo uma satisfação pelo pecado, nem a causa do perdão",
    "explicacao": "Seção III distingue claramente: o perdão é ato da livre graça de Deus em Cristo, mas o arrependimento é, ainda assim, necessário aos pecadores."
  },
  {
    "id": 65,
    "capitulo": "VII - Do Pacto de Deus com o Homem",
    "pergunta": "Segundo a Seção II, o pacto de obras feito com Adão prometia vida sob qual condição?",
    "alternativas": [
      "Observância exclusivamente do preceito de não comer da árvore proibida, sem exigência mais ampla",
      "Fé sincera, ainda que acompanhada de obediência imperfeita",
      "Obediência parcial, suficiente desde que a intenção fosse reta",
      "Perfeita obediência pessoal",
      "Arrependimento contínuo diante de qualquer transgressão cometida"
    ],
    "respostaCorreta": "Perfeita obediência pessoal",
    "explicacao": "Seção II: 'foi a vida prometida a Adão... sob a condição de perfeita obediência pessoal'."
  },
  {
    "id": 66,
    "capitulo": "III - Dos Eternos Decretos de Deus",
    "pergunta": "O debate teológico entre supralapsarianismo e infralapsarianismo trata da ordem lógica dos decretos divinos. Como o texto do Capítulo III se posiciona explicitamente nesse debate?",
    "alternativas": [
      "O texto condena formalmente o supralapsarianismo como incompatível com a soberania divina, o que esvaziaria o sentido pastoral atribuído à seção",
      "O texto declara explicitamente a ordem infralapsariana, afirmando que o decreto de eleição pressupõe logicamente a queda já decretada",
      "O texto resolve o debate citando Romanos 9 como prova conclusiva a favor de uma das duas ordens, divergindo do que a seção afirma de modo explícito",
      "O texto declara explicitamente a ordem supralapsariana, afirmando que o decreto de eleição precede logicamente o decreto da queda, o que não corresponde à formulação exata usada pela Confissão",
      "O texto não adota terminologia técnica de nenhum dos dois esquemas, permitindo historicamente leituras supra e infralapsarianas dentro da tradição reformada"
    ],
    "respostaCorreta": "O texto não adota terminologia técnica de nenhum dos dois esquemas, permitindo historicamente leituras supra e infralapsarianas dentro da tradição reformada",
    "explicacao": "O Capítulo III é redigido de modo deliberadamente amplo quanto à ordem lógica dos decretos, sem comprometer-se formalmente com supra ou infralapsarianismo — por isso ambas as posições convivem historicamente dentro do presbiterianismo confessional."
  },
  {
    "id": 67,
    "capitulo": "XIV - Da Fé Salvadora",
    "pergunta": "Segundo a Seção III, a fé salvadora, quanto ao seu grau ao longo da vida do crente:",
    "alternativas": [
      "Permanece estática, sem qualquer relação com as provações ou tentações enfrentadas pelo crente",
      "Uma vez enfraquecida por assaltos e dúvidas, não pode mais ser restaurada nesta vida",
      "Pode ser fraca ou forte, sendo muitas vezes assaltada e enfraquecida, mas sempre alcançando a vitória final",
      "É anulada por qualquer dúvida momentânea, exigindo nova conversão para ser restabelecida",
      "É concedida sempre em grau máximo desde a conversão, não admitindo variação posterior"
    ],
    "respostaCorreta": "Pode ser fraca ou forte, sendo muitas vezes assaltada e enfraquecida, mas sempre alcançando a vitória final",
    "explicacao": "Seção III: a fé 'é de diferentes graus... pode ser muitas vezes e de muitos modos assaltada e enfraquecida, mas sempre alcança a vitória'."
  },
  {
    "id": 68,
    "capitulo": "XIII - Da Santificação",
    "pergunta": "Segundo a Seção II, a santificação nesta vida é descrita como:",
    "alternativas": [
      "Presente no homem todo, mas imperfeita, restando uma guerra contínua e irreconciliável entre carne e espírito",
      "Progressiva até alcançar impecabilidade plena ainda nesta vida, para os crentes mais maduros",
      "Um processo reservado exclusivamente ao momento da glorificação, não iniciado nesta vida",
      "Limitada à vida interior, sem qualquer efeito prático sobre o comportamento exterior do crente",
      "Completa no momento da regeneração, restando apenas o combate contra tentações puramente externas"
    ],
    "respostaCorreta": "Presente no homem todo, mas imperfeita, restando uma guerra contínua e irreconciliável entre carne e espírito",
    "explicacao": "Seção II: a santificação é 'no homem todo, porém imperfeita nesta vida... uma guerra contínua e irreconciliável'."
  },
  {
    "id": 69,
    "capitulo": "XIX - Da Lei de Deus",
    "pergunta": "Segundo a Seção VI, os verdadeiros crentes, embora não estejam sob a lei como pacto de obras para serem justificados ou condenados por ela, ainda assim:",
    "alternativas": [
      "Ficam inteiramente dispensados de qualquer relação com a lei moral, por já estarem sob a graça",
      "Devem observar a lei apenas como conselho opcional, sem qualquer função normativa em sua vida",
      "Permanecem sob a mesma condenação potencial da lei, caso não a cumpram integralmente cada dia",
      "São instruídos a evitar qualquer uso da lei, sob risco de recair no legalismo condenado por Paulo",
      "Recebem da lei grande proveito como regra de vida, que revela o pecado, humilha e conduz a maior apreciação de Cristo"
    ],
    "respostaCorreta": "Recebem da lei grande proveito como regra de vida, que revela o pecado, humilha e conduz a maior apreciação de Cristo",
    "explicacao": "Seção VI descreve o chamado 'terceiro uso da lei': ainda não como pacto de obras, a lei orienta, humilha e conduz o crente a Cristo — distinta de uma leitura que dispensa totalmente a lei da vida do crente."
  },
  {
    "id": 70,
    "capitulo": "XXIII - Do Magistrado Civil",
    "pergunta": "A Seção I, sobre Deus constituir magistrados civis armados com o poder da espada, cita qual destas referências?",
    "alternativas": [
      "I Ped. 2:13-16 (citada na Seção IV, sobre honrar e obedecer aos magistrados)",
      "Rom. 13:1-4",
      "Mat. 16:19 (citada na Seção III, sobre o poder das chaves não pertencer ao magistrado)",
      "Prov. 8:15-16 (citada na Seção II, sobre ser lícito aos cristãos exercer a magistratura)",
      "At. 25:10-11 (citada na Seção IV, sobre o papa não ter jurisdição sobre os magistrados)"
    ],
    "respostaCorreta": "Rom. 13:1-4",
    "explicacao": "A Seção I cita Rom. 13:1-4 e I Ped. 2:13-14, referentes à instituição divina do magistrado civil; as demais pertencem a outras seções do capítulo."
  },
  {
    "id": 71,
    "capitulo": "XX - Da Liberdade Cristã e da Liberdade de Consciência",
    "pergunta": "Segundo a Seção IV, aqueles que, sob pretexto de liberdade cristã, se opõem a qualquer poder legítimo civil ou religioso:",
    "alternativas": [
      "Resistem à ordenança de Deus e podem ser processados e visitados com as censuras eclesiásticas, conforme o caso",
      "São protegidos pela Confissão desde que aleguem motivação estritamente religiosa para sua oposição",
      "Ficam sujeitos apenas à disciplina civil, estando isentos de qualquer censura eclesiástica",
      "Devem ser tolerados sempre, pois a liberdade cristã prevalece sobre qualquer autoridade instituída",
      "Exercem legitimamente seu direito de consciência, imunes a qualquer censura civil ou eclesiástica"
    ],
    "respostaCorreta": "Resistem à ordenança de Deus e podem ser processados e visitados com as censuras eclesiásticas, conforme o caso",
    "explicacao": "Seção IV: tal oposição 'resiste à ordenança de Deus' e pode, de justiça, ser processada e visitada com censuras eclesiásticas."
  },
  {
    "id": 72,
    "capitulo": "VI - Da Queda do Homem, do Pecado e do seu Castigo",
    "pergunta": "Segundo a Seção V, a corrupção da natureza que persiste nos regenerados durante esta vida:",
    "alternativas": [
      "É inteiramente removida no momento do batismo, restando apenas tentações externas, apesar de soar plausível a uma leitura apressada do capítulo",
      "Torna-se moralmente neutra, sendo culpável apenas quando reincide reiteradamente, posição incompatível com o restante do texto confessional",
      "Só volta a ser pecado se resultar em um ato exterior deliberado e consciente, divergindo do que a seção afirma de modo explícito",
      "É, tanto ela quanto os seus impulsos, real e propriamente pecado, ainda que perdoada e mortificada por Cristo",
      "Deixa de ser propriamente pecado assim que a pessoa é regenerada, tornando-se mera fraqueza moral"
    ],
    "respostaCorreta": "É, tanto ela quanto os seus impulsos, real e propriamente pecado, ainda que perdoada e mortificada por Cristo",
    "explicacao": "Seção V: mesmo perdoada e mortificada, a corrupção remanescente e seus impulsos 'são real e propriamente pecado'."
  },
  {
    "id": 73,
    "capitulo": "XI - Da Justificação",
    "pergunta": "Segundo a Seção II, qual é a relação entre a fé justificadora e as boas obras, segundo a fórmula da Confissão — em contraste com uma leitura antinomista?",
    "alternativas": [
      "A fé e as boas obras são igualmente instrumentos de justificação, cooperando lado a lado, o que não corresponde à formulação exata usada pela Confissão",
      "As boas obras precedem a fé, preparando o coração para recebê-la legitimamente, apesar de soar plausível a uma leitura apressada do capítulo",
      "A fé justificadora dispensa qualquer fruto visível, manifestando-se apenas internamente, ainda que essa leitura seja defendida por outras tradições cristãs",
      "A fé nunca está sozinha na pessoa justificada, mas sempre é acompanhada de outras graças salvadoras e obra por amor",
      "A fé justificadora é suficiente por si mesma, sendo as boas obras inteiramente irrelevantes após a justificação"
    ],
    "respostaCorreta": "A fé nunca está sozinha na pessoa justificada, mas sempre é acompanhada de outras graças salvadoras e obra por amor",
    "explicacao": "Seção II: a fé 'não está sozinha na pessoa justificada... não é uma fé morta, mas obra por amor' — contra o antinomismo, mas sem tornar as obras instrumento de justificação."
  },
  {
    "id": 74,
    "capitulo": "XVII - Da Perseverança dos Santos",
    "pergunta": "A Seção I, sobre os santos não poderem decair do estado de graça nem total nem finalmente, cita qual destas referências?",
    "alternativas": [
      "João 10:28-29",
      "Rom. 8:33-34, 38-39 (citada na Seção II, sobre nada poder separar do amor de Cristo)",
      "I João 2:19 (citada na Seção II, sobre os que saíram por não serem dos nossos)",
      "II Tim. 2:19 (citada na Seção II, sobre o fundamento e o selo do Senhor)",
      "Jer. 31:3 (citada na Seção II, sobre o amor imutável de Deus Pai)"
    ],
    "respostaCorreta": "João 10:28-29",
    "explicacao": "A Seção I cita Fil. 1:6, João 10:28-29 e I Ped. 1:5, 9; as demais alternativas pertencem à Seção II do mesmo capítulo."
  },
  {
    "id": 75,
    "capitulo": "IV - Da Criação",
    "pergunta": "A expressão da Seção I, 'no espaço de seis dias', tem sido historicamente central em debates confessionais reformados. Qual leitura essa expressão tende a apoiar, segundo boa parte dos intérpretes confessionalistas mais estritos?",
    "alternativas": [
      "Um único instante atemporal de criação, sendo os 'seis dias' apenas um recurso literário posterior",
      "Seis semanas simbólicas, cada uma representando uma época da história da Igreja",
      "Um relato mítico sem qualquer pretensão cronológica, análogo às cosmogonias do antigo Oriente Próximo",
      "Seis períodos geológicos de duração indeterminada, compatíveis com a cronologia da geologia moderna",
      "Seis dias literais e sucessivos de criação, em oposição a leituras de dias-eras ou puramente alegóricas"
    ],
    "respostaCorreta": "Seis dias literais e sucessivos de criação, em oposição a leituras de dias-eras ou puramente alegóricas",
    "explicacao": "A frase 'no espaço de seis dias' é historicamente lida por confessionalistas mais estritos como apoio à criação em seis dias literais, embora o tema tenha gerado debate dentro do presbiterianismo conservador."
  },
  {
    "id": 76,
    "capitulo": "XXVIII - Do Batismo",
    "pergunta": "Segundo a Seção IV, além dos que professam fé pessoal em Cristo, quem mais deve ser batizado, segundo a Confissão — em contraste com a posição credobatista?",
    "alternativas": [
      "Nenhuma criança, devendo o batismo aguardar sempre a profissão pessoal e consciente de fé",
      "Qualquer criança apresentada por padrinhos, independentemente da fé dos pais biológicos",
      "Somente crianças cujos dois pais sejam membros comungantes plenos da mesma congregação local",
      "Apenas adultos que tenham completado um período formal de instrução catequética prévia",
      "Os filhos de pais crentes, ainda que apenas um dos pais seja crente"
    ],
    "respostaCorreta": "Os filhos de pais crentes, ainda que apenas um dos pais seja crente",
    "explicacao": "Seção IV afirma o batismo infantil de filhos de ao menos um pai crente — posição que se distingue da exigência credobatista de profissão pessoal de fé como pré-requisito ao batismo."
  },
  {
    "id": 77,
    "capitulo": "V - Da Providência",
    "pergunta": "Segundo a Seção IV, a providência de Deus sobre a queda e os pecados dos anjos e dos homens ocorre:",
    "alternativas": [
      "Não por mera permissão passiva, mas por uma permissão que sábia e poderosamente limita, regula e governa o mal para fins santos, sem que Deus seja o autor do pecado",
      "Por mera permissão passiva, sem qualquer governo, limite ou direção divina sobre o que ocorre, ideia que o texto da Confissão, lido em conjunto, não sustenta",
      "Por retirada total da providência nesses casos, agindo o mal fora do controle soberano de Deus, apesar de soar plausível a uma leitura apressada do capítulo",
      "Por decreto direto e eficiente do mal, do mesmo modo como Deus decreta e produz o bem, o que não corresponde à formulação exata usada pela Confissão, contrariando o sentido direto do texto citado nessa seção",
      "Por cooperação simétrica entre Deus e Satanás na produção do mal moral, posição incompatível com o restante do texto confessional, o que esvaziaria o sentido pastoral atribuído à seção"
    ],
    "respostaCorreta": "Não por mera permissão passiva, mas por uma permissão que sábia e poderosamente limita, regula e governa o mal para fins santos, sem que Deus seja o autor do pecado",
    "explicacao": "Seção IV distingue cuidadosamente entre governo soberano do mal e autoria do mal: Deus governa e limita, mas a pecaminosidade procede só da criatura."
  },
  {
    "id": 78,
    "capitulo": "IV - Da Criação",
    "pergunta": "Segundo a Seção II, antes da queda, a vontade de Adão e Eva em relação ao pecado era:",
    "alternativas": [
      "Imutavelmente fixada no bem, sem qualquer possibilidade real de pecar",
      "Neutra e sem capacidade moral alguma, adquirida somente após comerem do fruto",
      "Já inclinada ao mal, sendo a queda apenas a manifestação de uma tendência preexistente",
      "Mutável — tinham poder de obedecer, mas também a possibilidade real de transgredir",
      "Determinada exclusivamente por Satanás, sem responsabilidade moral própria"
    ],
    "respostaCorreta": "Mutável — tinham poder de obedecer, mas também a possibilidade real de transgredir",
    "explicacao": "Seção II: tinham 'o poder de cumpri-la, mas com a possibilidade de transgredi-la, sendo deixados à liberdade da sua própria vontade, que era mutável'."
  },
  {
    "id": 79,
    "capitulo": "XXXI - Dos Sínodos e Concílios",
    "pergunta": "Segundo a Seção IV, os sínodos e concílios não devem discutir ou determinar:",
    "alternativas": [
      "Qualquer matéria disciplinar interna, que deve ser deixada inteiramente às congregações locais, posição incompatível com o restante do texto confessional",
      "Questões doutrinárias já tratadas em concílios anteriores, ainda que de forma insatisfatória, contrariando o sentido direto do texto citado nessa seção",
      "Assuntos relacionados à ordenação de ministros, reservados exclusivamente aos presbitérios locais, ainda que essa leitura seja defendida por outras tradições cristãs",
      "Nenhuma questão de fé, devendo restringir-se exclusivamente a assuntos de organização administrativa, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo",
      "Coisa alguma que não seja eclesiástica, nem imiscuir-se nos negócios civis do Estado, salvo por humilde petição em casos extraordinários"
    ],
    "respostaCorreta": "Coisa alguma que não seja eclesiástica, nem imiscuir-se nos negócios civis do Estado, salvo por humilde petição em casos extraordinários",
    "explicacao": "Seção IV: sínodos não devem tratar de assuntos não eclesiásticos nem interferir nos negócios civis, exceto por humilde petição em casos extraordinários ou a convite do magistrado."
  },
  {
    "id": 80,
    "capitulo": "XVIII - Da Certeza da Graça e da Salvação",
    "pergunta": "Segundo a Seção III, a segurança infalível de salvação pertence à essência da fé de tal modo que todo crente verdadeiro a possui desde o início da sua fé?",
    "alternativas": [
      "Não; a segurança infalível é, na verdade, inatingível nesta vida para qualquer crente, por mais maduro que seja, o que esvaziaria o sentido pastoral atribuído à seção",
      "Não é tratado nesta seção, que se ocupa apenas da natureza da fé, não da certeza, tal como sustentado por correntes teológicas distintas da reformada",
      "Sim, mas apenas para os que recebem uma revelação extraordinária confirmando sua eleição, apesar de soar plausível a uma leitura apressada do capítulo",
      "Sim; a fé salvadora inclui necessariamente, desde o primeiro momento, a certeza plena e consciente da salvação, contrariando o sentido direto do texto citado nessa seção",
      "Não; um crente verdadeiro pode esperar muito e lutar com dificuldades antes de alcançá-la, ainda que ela seja acessível pelo uso dos meios ordinários"
    ],
    "respostaCorreta": "Não; um crente verdadeiro pode esperar muito e lutar com dificuldades antes de alcançá-la, ainda que ela seja acessível pelo uso dos meios ordinários",
    "explicacao": "Seção III: a segurança infalível 'não pertence de tal modo à essência da fé, que um verdadeiro crente, antes de possuí-la, não tenha de esperar muito e lutar com muitas dificuldades'."
  },
  {
    "id": 81,
    "capitulo": "XIII - Da Santificação",
    "pergunta": "Segundo a Seção III, quem prevalece, ao final, na guerra entre a carne e o espírito no crente?",
    "alternativas": [
      "A parte regenerada do homem novo, pelo contínuo socorro do Espírito de Cristo, embora as corrupções remanescentes possam prevalecer por algum tempo",
      "A carne e o espírito se equilibram de forma estável, sem que a santificação avance com o tempo, ainda que essa leitura seja defendida por outras tradições cristãs",
      "Nenhuma das partes prevalece definitivamente; a guerra permanece em empate perpétuo nesta vida, o que não corresponde à formulação exata usada pela Confissão",
      "A vitória depende inteiramente do esforço moral do crente, sem relação direta com a obra do Espírito, divergindo do que a seção afirma de modo explícito",
      "A carne prevalece de modo permanente, sendo a vitória do espírito reservada apenas para depois da morte, ideia que o texto da Confissão, lido em conjunto, não sustenta"
    ],
    "respostaCorreta": "A parte regenerada do homem novo, pelo contínuo socorro do Espírito de Cristo, embora as corrupções remanescentes possam prevalecer por algum tempo",
    "explicacao": "Seção III: 'a parte regenerada do homem novo vence, e assim os santos crescem em graça', ainda que as corrupções remanescentes prevaleçam por algum tempo."
  },
  {
    "id": 82,
    "capitulo": "III - Dos Eternos Decretos de Deus",
    "pergunta": "A Seção VI do Capítulo III, sobre os meios que Deus preordenou para conduzir os eleitos à glória (queda, redenção por Cristo, vocação eficaz e santificação), cita qual destas referências, também citada na mesma seção?",
    "alternativas": [
      "Rom. 9:22-23 (citada na Seção III, sobre a predestinação de homens e anjos)",
      "At. 15:18 (citada na Seção II, sobre Deus não decretar por presciência)",
      "Isa. 45:6-7 (citada na Seção I, sobre o decreto não ser autor do pecado)",
      "I Pedro 1:2",
      "Deut. 29:29 (citada na Seção VIII, sobre a prudência ao tratar da predestinação)"
    ],
    "respostaCorreta": "I Pedro 1:2",
    "explicacao": "A Seção VI cita I Pedro 1:2 entre suas referências; as demais opções pertencem a outras seções do mesmo capítulo, o que exige atenção à seção exata."
  },
  {
    "id": 83,
    "capitulo": "IX - Do Livre Arbítrio",
    "pergunta": "Segundo a Seção IV, quando Deus converte um pecador, este passa a:",
    "alternativas": [
      "Agir sempre movido apenas pelo bem, sem jamais desejar o que é mau em qualquer medida, o que esvaziaria o sentido pastoral atribuído à seção",
      "Perder toda capacidade de pecar, tornando-se moralmente impecável a partir da conversão, ainda que essa leitura seja defendida por outras tradições cristãs",
      "Fazer o bem de modo perfeito e imutável já nesta vida, sem qualquer resquício de corrupção, apesar de soar plausível a uma leitura apressada do capítulo",
      "Alcançar liberdade plena e definitiva apenas depois de completar um processo formal de santificação, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo",
      "Querer e fazer com liberdade o que é espiritualmente bom, ainda que, por causa da corrupção remanescente, não o faça perfeitamente"
    ],
    "respostaCorreta": "Querer e fazer com liberdade o que é espiritualmente bom, ainda que, por causa da corrupção remanescente, não o faça perfeitamente",
    "explicacao": "Seção IV: a graça habilita para o bem 'com toda a liberdade', mas 'por causa da corrupção, ainda nele existente, o pecador não faz o bem perfeitamente'."
  },
  {
    "id": 84,
    "capitulo": "XXII - Dos Juramentos Legais e dos Votos",
    "pergunta": "Segundo a Seção VII, como a Confissão avalia os votos monásticos de celibato perpétuo, pobreza voluntária e obediência regular?",
    "alternativas": [
      "Como neutras, aceitáveis desde que a pessoa as tenha assumido livremente e sem coação",
      "Como práticas legítimas, embora reservadas apenas a uma minoria de vocação especial",
      "Como recomendáveis, embora não obrigatórias para a generalidade dos cristãos",
      "Como laços supersticiosos e iníquos, e não como graus de maior perfeição espiritual",
      "Como equivalentes espirituais ao batismo, quando feitos com sinceridade de coração"
    ],
    "respostaCorreta": "Como laços supersticiosos e iníquos, e não como graus de maior perfeição espiritual",
    "explicacao": "Seção VII: tais votos 'não passam de laços supersticiosos e iníquos com os quais nenhum cristão deve embaraçar-se'."
  },
  {
    "id": 85,
    "capitulo": "XV - Do Arrependimento para a Vida",
    "pergunta": "Segundo a Seção IV, sobre a gravidade relativa dos pecados e o alcance do perdão, a Confissão ensina que:",
    "alternativas": [
      "Existem pecados veniais, que não separam da graça, e pecados mortais, que exigem penitência formal",
      "A gravidade do pecado é irrelevante, pois todo pecado recebe o mesmo grau de punição eterna, contrariando o sentido direto do texto citado nessa seção",
      "Todo pecado, por menor que seja, é automaticamente perdoado, independentemente de arrependimento, o que não corresponde à formulação exata usada pela Confissão",
      "Certos pecados são categoricamente imperdoáveis, mesmo diante de arrependimento sincero e genuíno, posição incompatível com o restante do texto confessional",
      "Não há pecado tão pequeno que não mereça condenação, nem pecado tão grande que condene os que verdadeiramente se arrependem"
    ],
    "respostaCorreta": "Não há pecado tão pequeno que não mereça condenação, nem pecado tão grande que condene os que verdadeiramente se arrependem",
    "explicacao": "Seção IV: nenhum pecado é pequeno demais para merecer condenação, nem grande demais para impedir o perdão ao verdadeiramente arrependido — distinta da distinção católica entre pecados veniais e mortais."
  },
  {
    "id": 86,
    "capitulo": "XIX - Da Lei de Deus",
    "pergunta": "Segundo a Seção III, as leis cerimoniais dadas a Israel, sob a Confissão:",
    "alternativas": [
      "Permanecem parcialmente em vigor, sobretudo quanto às leis alimentares e de pureza ritual",
      "Foram substituídas por um novo conjunto de leis cerimoniais próprias da Igreja cristã",
      "Continuam obrigando os cristãos de origem judaica, embora não os gentios convertidos",
      "Nunca foram formalmente abolidas, apenas reinterpretadas espiritualmente pela Igreja",
      "Estão todas abrogadas sob o Novo Testamento, tendo prefigurado Cristo e seus benefícios"
    ],
    "respostaCorreta": "Estão todas abrogadas sob o Novo Testamento, tendo prefigurado Cristo e seus benefícios",
    "explicacao": "Seção III: essas leis cerimoniais 'estão todas abrogadas sob o Novo Testamento'."
  },
  {
    "id": 87,
    "capitulo": "XVI - Das Boas Obras",
    "pergunta": "Segundo a Seção VII, as obras moralmente boas realizadas por pessoas não regeneradas são descritas pela Confissão como:",
    "alternativas": [
      "Neutras diante de Deus, nem boas nem más, já que dependem apenas da intenção subjetiva de quem as pratica, ainda que alguns leitores tentem harmonizá-la com o restante do capítulo",
      "Meritórias o suficiente para preparar o não regenerado a receber a graça salvadora, apesar de soar plausível a uma leitura apressada do capítulo",
      "Pecaminosas diante de Deus, por não procederem de um coração purificado pela fé nem visarem à glória de Deus, embora negligenciá-las seja ainda mais ofensivo",
      "Irrelevantes para a avaliação moral, pois só contam as obras realizadas após a conversão, contrariando o sentido direto do texto citado nessa seção",
      "Plenamente aceitáveis diante de Deus, desde que úteis à sociedade e sinceramente motivadas, tal como sustentado por correntes teológicas distintas da reformada"
    ],
    "respostaCorreta": "Pecaminosas diante de Deus, por não procederem de um coração purificado pela fé nem visarem à glória de Deus, embora negligenciá-las seja ainda mais ofensivo",
    "explicacao": "Seção VII: tais obras 'não são feitas devidamente... nem para um fim justo... são pecaminosas e não podem agradar a Deus', mas negligenciá-las é ainda mais pecaminoso."
  },
  {
    "id": 88,
    "capitulo": "XXIX - Da Ceia do Senhor",
    "pergunta": "A Seção VI, que rejeita a doutrina da transubstanciação por ser contrária às Escrituras, ao senso comum e à razão, cita qual destas referências?",
    "alternativas": [
      "I Tim. 1:3-4 (citada na Seção IV, sobre a rejeição da adoração dos elementos)",
      "Heb. 9:22, 25-26 (citada na Seção II, sobre a rejeição do sacrifício da missa)",
      "Luc. 24:6, 39",
      "Mar. 14:22-24 (citada na Seção III, sobre o ministério da palavra de instituição)",
      "I Cor. 11:23-26 (citada na Seção I, sobre a instituição da Ceia do Senhor)"
    ],
    "respostaCorreta": "Luc. 24:6, 39",
    "explicacao": "A Seção VI cita At. 3:21, I Cor. 11:24-26 e Luc. 24:6, 39 — este último associado à ressurreição corporal de Cristo, argumento contra a transubstanciação; as demais pertencem a outras seções."
  },
  {
    "id": 89,
    "capitulo": "XX - Da Liberdade Cristã e da Liberdade de Consciência",
    "pergunta": "Segundo a Seção II, exigir fé implícita e obediência cega a doutrinas ou mandamentos humanos contrários ou alheios à palavra de Deus é descrito pela Confissão como:",
    "alternativas": [
      "Um exercício tolerável de disciplina, desde que confirmado por consenso da congregação local",
      "Uma expressão válida da submissão cristã à autoridade humana, mesmo sem base bíblica direta",
      "Uma prática neutra, aceitável enquanto não contradiga diretamente um mandamento explícito da Escritura",
      "Um exercício legítimo de autoridade eclesiástica, desde que exercido por oficiais devidamente ordenados",
      "Uma traição à verdadeira liberdade de consciência, e destruição dessa liberdade e da própria razão"
    ],
    "respostaCorreta": "Uma traição à verdadeira liberdade de consciência, e destruição dessa liberdade e da própria razão",
    "explicacao": "Seção II: exigir fé implícita e obediência cega e absoluta 'é destruir a liberdade de consciência e a mesma razão'."
  },
  {
    "id": 90,
    "capitulo": "XXXV - Do Amor de Deus e das Missões",
    "pergunta": "Segundo a Seção III, quem é apontado como o único responsável por sua própria perdição, entre os que ouvem o Evangelho?",
    "alternativas": [
      "Deus, por não ter decretado a salvação de todos os que ouvem o Evangelho igualmente",
      "A Igreja, por não ter pregado com suficiente clareza a mensagem em todos os casos",
      "Os pais ou responsáveis, por não terem instruído adequadamente os que rejeitam a fé",
      "Os que continuam impenitentes e incrédulos diante da oferta do Evangelho já ouvida",
      "Ninguém em particular, já que a perdição é atribuída inteiramente a causas impessoais"
    ],
    "respostaCorreta": "Os que continuam impenitentes e incrédulos diante da oferta do Evangelho já ouvida",
    "explicacao": "Seção III: 'os que continuam impenitentes e incrédulos agravam a sua falta e são os únicos culpados pela sua perdição'."
  },
  {
    "id": 91,
    "capitulo": "XXI - Do Culto Religioso e do Domingo",
    "pergunta": "Segundo a Seção VII, desde a ressurreição de Cristo até o fim do mundo, o sábado cristão deve ser observado:",
    "alternativas": [
      "No primeiro dia da semana, chamado Domingo, ou dia do Senhor",
      "Em qualquer dia da semana, à escolha de cada crente, conforme sua conveniência",
      "No sétimo dia da semana, tal como antes da ressurreição, sem alteração alguma",
      "Não há mais um dia especialmente separado sob a nova aliança do Evangelho",
      "Apenas em ocasiões especiais determinadas pelo calendário litúrgico de cada igreja"
    ],
    "respostaCorreta": "No primeiro dia da semana, chamado Domingo, ou dia do Senhor",
    "explicacao": "Seção VII: o dia foi mudado do último para o primeiro dia da semana, chamado Domingo, e há de continuar até o fim do mundo como o sábado cristão."
  },
  {
    "id": 92,
    "capitulo": "XXI - Do Culto Religioso e do Domingo",
    "pergunta": "Segundo a Seção I, o modo aceitável de adorar a Deus é determinado por qual princípio — em contraste com uma prática litúrgica que permite tudo o que não é expressamente proibido?",
    "alternativas": [
      "Deve seguir a tradição consolidada da Igreja, ainda quando não explicitamente prescrita na Escritura",
      "Pode incluir qualquer prática que não seja expressamente proibida nas Escrituras, desde que edificante",
      "Deve equilibrar a Escritura com a razão natural, complementando uma pela outra quando necessário",
      "Deve ser instituído pelo próprio Deus e limitado à sua vontade revelada, não podendo seguir invenções humanas",
      "Fica a critério de cada congregação local, conforme sua cultura e contexto histórico específico"
    ],
    "respostaCorreta": "Deve ser instituído pelo próprio Deus e limitado à sua vontade revelada, não podendo seguir invenções humanas",
    "explicacao": "Seção I segue o chamado 'princípio regulador do culto': só é aceitável o que Deus mesmo instituiu, não 'as imaginações e invenções dos homens' — em contraste com o 'princípio normativo' de outras tradições protestantes."
  },
];
