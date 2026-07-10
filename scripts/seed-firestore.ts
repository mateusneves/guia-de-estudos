// Script de migração única: popula o Firestore com os dados que hoje estão
// hardcoded em src/app/data/curso.data.ts (disciplinas, horários e avaliações),
// criando a turma "3º Ano · 1º Semestre 2026".
//
// Como rodar:
//   1. Baixe a chave da service account em:
//      Firebase Console → Configurações do projeto → Contas de serviço → Gerar nova chave privada
//   2. Salve o arquivo JSON baixado como scripts/service-account.json (não commitar!)
//   3. Rode: npx tsx scripts/seed-firestore.ts

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DISCIPLINAS } from '../src/app/data/curso.data';

const caminhoServiceAccount = join(__dirname, 'service-account.json');
const serviceAccount = JSON.parse(readFileSync(caminhoServiceAccount, 'utf-8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seed(): Promise<void> {
  const turmaRef = db.collection('turmas').doc();
  await turmaRef.set({
    nome: '3º Ano · 1º Semestre 2026',
    anoSemestre: '2026.1',
    ativa: true,
    criadoEm: new Date().toISOString(),
  });
  console.log(`Turma criada: ${turmaRef.id}`);

  for (const disciplina of DISCIPLINAS) {
    const { avaliacoes, ...dadosDisciplina } = disciplina;

    await db.collection('disciplinas').doc(disciplina.id).set({
      ...dadosDisciplina,
      turmaId: turmaRef.id,
    });
    console.log(`  Disciplina: ${disciplina.codigo} - ${disciplina.nome}`);

    for (const avaliacao of avaliacoes) {
      await db.collection('avaliacoes').doc(avaliacao.id).set({
        ...avaliacao,
        turmaId: turmaRef.id,
      });
    }
    console.log(`    ${avaliacoes.length} avaliação(ões) migradas.`);
  }

  console.log('\nSeed concluído.');
  console.log(`ID da turma criada: ${turmaRef.id}`);
  console.log('Use esse ID (ou o nome da turma no dropdown de cadastro) para criar sua conta pelo app.');
}

seed().catch(err => {
  console.error('Erro ao rodar o seed:', err);
  process.exit(1);
});
