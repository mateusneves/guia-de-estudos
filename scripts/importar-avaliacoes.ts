// Importa um lote de avaliações/atividades a partir de um JSON exportado externamente
// (ex: de uma planilha do plano de ensino), escrevendo direto na coleção `avaliacoes`
// via firebase-admin (bypassa firestore.rules).
//
// Diferente do seed-firestore.ts, este script é ADITIVO — não limpa nenhuma coleção.
// Ele resolve `disciplinaId` do JSON (que aqui é o CÓDIGO da disciplina, ex: "tp04",
// não o id real do Firestore) consultando `disciplinas` pelo `periodoId` do próprio
// JSON, e escreve cada avaliação com o id do Firestore correto.
//
// Como rodar:
//   npx tsx scripts/importar-avaliacoes.ts scripts/data/atividades_avaliativas_2026_2.json

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

interface AtividadeImportada {
  id: string;
  periodoId: string;
  disciplinaId: string; // código da disciplina, não o id do Firestore
  descricao: string;
  data: string | null;
  dataDisplay: string | null;
  pontos: number;
  tipo: string;
}

const caminhoServiceAccount = join(__dirname, 'service-account.json');
const serviceAccount = JSON.parse(readFileSync(caminhoServiceAccount, 'utf-8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

/** O JSON de origem tem mojibake (UTF-8 lido como Latin-1 e regravado como UTF-8) —
    reverte isso, e depois normaliza dois artefatos que o round-trip por si só não
    resolve porque não sobreviveram como sequências multi-byte válidas até chegar aqui
    (perderam um byte em algum passo anterior de cópia/conversão da origem):
      - "â" isolado no lugar de um travessão entre cláusulas (o "à€"/aspas que viriam
        depois dele se perderam, sobrou só o primeiro byte decodificado);
      - "Ã" seguido de espaço(s) no lugar de "à" (o segundo byte de "à" duplo-codificado
        é 0xA0 = espaço não-quebrável em Latin-1, que virou espaço comum antes de chegar
        aqui — em "Ã  " isso sobra como *dois* espaços de verdade, em "Ã s" sobra como um
        espaço onde não deveria haver nenhum, ex: "Ã s missÃµes" -> "às missões").
    Ambos precisam ser protegidos com um placeholder ANTES do round-trip latin1/utf8,
    porque um "â"/"Ã" isolado não decodifica como UTF-8 válido e o round-trip os
    substituiria por "�" em vez de deixá-los intactos. */
function corrigirTexto(s: string): string {
  const protegido = s
    .replace(/ â /g, ' @@DASH@@ ')
    .replace(/Ã {2}/g, '@@AGRAVE@@ ')
    .replace(/Ã s\b/g, '@@AGRAVE@@s');
  const semMojibake = Buffer.from(protegido, 'latin1').toString('utf8');
  return semMojibake
    .replace(/ @@DASH@@ /g, ' – ')
    .replace(/@@AGRAVE@@/g, 'à');
}

/** Deriva um título curto a partir da descrição longa — mesmo critério usado em
    seed-firestore.ts para avaliações sem campo `nome` próprio. */
function derivarNome(descricao: string): string {
  const antesDoTraco = descricao.split(' – ')[0].trim();
  if (antesDoTraco.length <= 60) return antesDoTraco;
  return antesDoTraco.slice(0, 57).trim() + '...';
}

async function importar(caminhoJson: string): Promise<void> {
  const atividades: AtividadeImportada[] = JSON.parse(readFileSync(caminhoJson, 'utf-8'));
  if (atividades.length === 0) {
    console.log('Nenhuma atividade no arquivo — nada a fazer.');
    return;
  }

  const periodoId = atividades[0].periodoId;
  if (atividades.some(a => a.periodoId !== periodoId)) {
    console.error('O arquivo mistura mais de um periodoId — este script assume um único período por execução.');
    process.exit(1);
  }

  const periodoSnap = await db.collection('periodos').doc(periodoId).get();
  if (!periodoSnap.exists) {
    console.error(`periodoId "${periodoId}" não existe em periodos/. Confira o id antes de importar.`);
    process.exit(1);
  }

  const disciplinasSnap = await db.collection('disciplinas').where('periodoId', '==', periodoId).get();
  const codigoParaId = new Map<string, string>();
  disciplinasSnap.docs.forEach(d => codigoParaId.set((d.data()['codigo'] as string).toLowerCase(), d.id));

  const codigosFaltantes = new Set<string>();
  for (const a of atividades) {
    if (!codigoParaId.has(a.disciplinaId.toLowerCase())) codigosFaltantes.add(a.disciplinaId);
  }
  if (codigosFaltantes.size > 0) {
    console.error(
      `Código(s) de disciplina sem correspondência em disciplinas/ para periodoId "${periodoId}": ` +
      [...codigosFaltantes].join(', ')
    );
    console.error('Nada foi gravado. Cadastre a(s) disciplina(s) faltante(s) (ou corrija o código no JSON) e rode de novo.');
    process.exit(1);
  }

  console.log(`Período: ${periodoId} — ${atividades.length} atividade(s), ${disciplinasSnap.size} disciplina(s) mapeada(s).`);

  const batch = db.batch();
  let contadorPorDisciplina = new Map<string, number>();
  for (const a of atividades) {
    const disciplinaId = codigoParaId.get(a.disciplinaId.toLowerCase())!;
    const descricao = corrigirTexto(a.descricao);
    const ref = db.collection('avaliacoes').doc(a.id);
    batch.set(ref, {
      periodoId: a.periodoId,
      disciplinaId,
      nome: derivarNome(descricao),
      descricao,
      data: a.data,
      dataDisplay: a.dataDisplay ?? 'Contínuo',
      pontos: a.pontos,
      tipo: a.tipo,
    });
    contadorPorDisciplina.set(a.disciplinaId, (contadorPorDisciplina.get(a.disciplinaId) ?? 0) + 1);
  }

  await batch.commit();

  console.log('Importação concluída:');
  for (const [codigo, qtd] of contadorPorDisciplina) {
    console.log(`  ${codigo}: ${qtd} atividade(s)`);
  }
}

const caminhoJson = process.argv[2];
if (!caminhoJson) {
  console.error('Uso: npx tsx scripts/importar-avaliacoes.ts <caminho-do-json>');
  process.exit(1);
}

importar(caminhoJson).catch(err => {
  console.error('Erro ao importar:', err);
  process.exit(1);
});
